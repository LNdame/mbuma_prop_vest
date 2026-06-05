import { Router, type Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma }        from '../lib/prisma.js';
import { presignUpload, publicUrl, presignDownload, deleteObject } from '../lib/storage.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router({ mergeParams: true }); // inherits :propertyId

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/* ── POST /api/properties/:propertyId/images/presign ─────────────────
   Body: { fileName, mimeType, sizeBytes }
   Returns: { uploadUrl, fields, s3Key, publicUrl }
   The browser then POSTs directly to the bucket using the presigned data.
──────────────────────────────────────────────────────────────────────── */
router.post(
  '/presign',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { fileName, mimeType, sizeBytes } = req.body as {
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    };

    if (!fileName || !mimeType || !sizeBytes) {
      res.status(400).json({ error: 'fileName, mimeType and sizeBytes are required' });
      return;
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      res.status(400).json({ error: 'Only JPEG, PNG, WebP and AVIF images are allowed' });
      return;
    }
    if (sizeBytes > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be under 10 MB' });
      return;
    }

    const ext   = fileName.split('.').pop() ?? 'jpg';
    const s3Key = `properties/${req.params.propertyId}/${randomUUID()}.${ext}`;

    const { url, fields } = await presignUpload(s3Key, mimeType, sizeBytes);

    res.json({
      uploadUrl:  url,
      fields,
      s3Key,
      // Bucket is private — hand back a signed URL the browser can display once uploaded
      publicImageUrl: await presignDownload(s3Key),
    });
  }
);

/* ── POST /api/properties/:propertyId/images ─────────────────────────
   Call AFTER the browser has uploaded to the bucket.
   Body: { s3Key, fileName, mimeType, sizeBytes, position? }
   Saves the record to DB and returns the image row.
──────────────────────────────────────────────────────────────────────── */
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { s3Key, fileName, mimeType, sizeBytes, position } = req.body as {
      s3Key?: string; fileName?: string; mimeType?: string;
      sizeBytes?: number; position?: number;
    };

    if (!s3Key || !fileName || !mimeType || !sizeBytes) {
      res.status(400).json({ error: 's3Key, fileName, mimeType and sizeBytes are required' });
      return;
    }

    const image = await prisma.propertyImage.create({
      data: {
        propertyId: req.params.propertyId,
        url:        publicUrl(s3Key),
        s3Key,
        fileName,
        mimeType,
        sizeBytes,
        position:   position ?? 0,
      },
    });

    res.status(201).json({ data: image });
  }
);

/* ── GET /api/properties/:propertyId/images ──────────────────────────── */
router.get('/', async (req: AuthRequest, res: Response) => {
  const images = await prisma.propertyImage.findMany({
    where:   { propertyId: req.params.propertyId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
  // Re-issue a signed read URL per image — the stored `url` points at a private object
  const data = await Promise.all(
    images.map(async (img) => ({ ...img, url: await presignDownload(img.s3Key) }))
  );
  res.json({ data });
});

/* ── PATCH /api/properties/:propertyId/images/reorder ────────────────
   Body: { order: string[] }  — array of image IDs in new order
──────────────────────────────────────────────────────────────────────── */
router.patch(
  '/reorder',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { order } = req.body as { order?: string[] };
    if (!Array.isArray(order)) {
      res.status(400).json({ error: 'order must be an array of image IDs' });
      return;
    }
    await Promise.all(
      order.map((id, position) =>
        prisma.propertyImage.update({ where: { id }, data: { position } })
      )
    );
    res.json({ ok: true });
  }
);

/* ── DELETE /api/properties/:propertyId/images/:imageId ──────────────── */
router.delete(
  '/:imageId',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const image = await prisma.propertyImage.delete({
        where: { id: req.params.imageId },
      });
      // Best-effort bucket delete — don't fail the request if bucket delete fails
      deleteObject(image.s3Key).catch(console.error);
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'Image not found' });
    }
  }
);

export default router;
