import { Router, type Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { presignUpload, presignDownload, deleteObject } from '../lib/storage.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* The three documents an investor must provide to be KYC compliant. */
const KYC_TYPES = ['id_document', 'selfie_with_id', 'proof_of_address'] as const;
type KycDocType = (typeof KYC_TYPES)[number];

const KYC_LABEL: Record<KycDocType, string> = {
  id_document:      'ID document',
  selfie_with_id:   'Selfie holding ID',
  proof_of_address: 'Proof of residence',
};

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PDF_MIME = 'application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

function isKycType(t: unknown): t is KycDocType {
  return typeof t === 'string' && (KYC_TYPES as readonly string[]).includes(t);
}

/** Selfie must be a photo; ID and proof of residence may be an image or a PDF. */
function mimeAllowed(docType: KycDocType, mime: string): boolean {
  if (docType === 'selfie_with_id') return IMAGE_MIME.has(mime);
  return IMAGE_MIME.has(mime) || mime === PDF_MIME;
}

/* ── GET /api/kyc ─────────────────────────────────────────────────────
   The investor's KYC status plus any documents already uploaded. */
router.get('/', requireAuth, requireRole('investor'), async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { kycStatus: true } });
  const docs = await prisma.document.findMany({
    where:   { userId: req.user!.sub, docType: { in: [...KYC_TYPES] } },
    orderBy: { createdAt: 'desc' },
  });
  const documents = await Promise.all(
    docs.map(async (d) => ({
      id: d.id, docType: d.docType, fileName: d.fileName, mimeType: d.mimeType,
      createdAt: d.createdAt, downloadUrl: await presignDownload(d.s3Key),
    })),
  );
  res.json({ data: { kycStatus: user?.kycStatus ?? 'pending', documents } });
});

/* ── POST /api/kyc/presign ────────────────────────────────────────────
   Body: { docType, fileName, mimeType, sizeBytes }
   Returns a presigned POST so the browser uploads straight to the bucket,
   under the kyc_documents/<userId>/ root. */
router.post('/presign', requireAuth, requireRole('investor'), async (req: AuthRequest, res: Response) => {
  const { docType, fileName, mimeType, sizeBytes } = req.body as {
    docType?: string; fileName?: string; mimeType?: string; sizeBytes?: number;
  };

  if (!docType || !fileName || !mimeType || !sizeBytes) {
    res.status(400).json({ error: 'docType, fileName, mimeType and sizeBytes are required' });
    return;
  }
  if (!isKycType(docType)) {
    res.status(400).json({ error: 'Invalid KYC document type' });
    return;
  }
  if (!mimeAllowed(docType, mimeType)) {
    res.status(400).json({
      error: docType === 'selfie_with_id'
        ? 'The selfie must be a JPEG, PNG or WebP image'
        : 'Only JPEG, PNG, WebP or PDF files are allowed',
    });
    return;
  }
  if (sizeBytes > MAX_BYTES) {
    res.status(400).json({ error: 'File must be under 10 MB' });
    return;
  }

  const ext   = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const s3Key = `kyc_documents/${req.user!.sub}/${docType}-${randomUUID()}.${ext}`;
  const { url, fields } = await presignUpload(s3Key, mimeType, sizeBytes);

  res.json({ uploadUrl: url, fields, s3Key });
});

/* ── POST /api/kyc/submit ─────────────────────────────────────────────
   Body: { documents: [{ docType, s3Key, fileName, mimeType }, ...] }
   Saves all three KYC documents (replacing any previous of the same type)
   and moves the investor into 'under_review'. */
router.post('/submit', requireAuth, requireRole('investor'), async (req: AuthRequest, res: Response) => {
  const { documents } = req.body as {
    documents?: Array<{ docType?: string; s3Key?: string; fileName?: string; mimeType?: string }>;
  };

  if (!Array.isArray(documents)) {
    res.status(400).json({ error: 'documents must be an array' });
    return;
  }

  const byType = new Map<KycDocType, { s3Key: string; fileName: string; mimeType: string }>();
  for (const d of documents) {
    if (!isKycType(d.docType)) {
      res.status(400).json({ error: `Invalid KYC document type: ${d.docType}` });
      return;
    }
    if (!d.s3Key || !d.fileName || !d.mimeType) {
      res.status(400).json({ error: 'Each document needs s3Key, fileName and mimeType' });
      return;
    }
    if (!mimeAllowed(d.docType, d.mimeType)) {
      res.status(400).json({ error: `Unsupported file type for ${KYC_LABEL[d.docType]}` });
      return;
    }
    byType.set(d.docType, { s3Key: d.s3Key, fileName: d.fileName, mimeType: d.mimeType });
  }

  const missing = KYC_TYPES.filter((t) => !byType.has(t));
  if (missing.length) {
    res.status(400).json({ error: `Missing required document(s): ${missing.map((t) => KYC_LABEL[t]).join(', ')}` });
    return;
  }

  const userId = req.user!.sub;

  // Replace any prior KYC documents of these types; clean up their bucket objects after.
  const stale = await prisma.document.findMany({
    where:  { userId, docType: { in: [...KYC_TYPES] } },
    select: { s3Key: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.document.deleteMany({ where: { userId, docType: { in: [...KYC_TYPES] } } });
    await tx.document.createMany({
      data: KYC_TYPES.map((t) => {
        const d = byType.get(t)!;
        return { userId, docType: t, fileName: d.fileName, s3Key: d.s3Key, mimeType: d.mimeType };
      }),
    });
    await tx.user.update({ where: { id: userId }, data: { kycStatus: 'under_review' } });
  });

  for (const s of stale) deleteObject(s.s3Key).catch(console.error);

  res.status(201).json({ data: { kycStatus: 'under_review' } });
});

export default router;
