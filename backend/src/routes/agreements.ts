import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { presignDownload } from '../lib/storage.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/agreements ─────────────────────────────────────────────
   Admin list of investment agreements with investor + property + a
   signed download URL, plus a status summary.
──────────────────────────────────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    const docs = await prisma.document.findMany({
      where:   { docType: 'investment_agreement' },
      orderBy: { createdAt: 'desc' },
      include: {
        user:     { select: { id: true, fullName: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    });

    const data = await Promise.all(
      docs.map(async (d) => ({
        id:            d.id,
        fileName:      d.fileName,
        signingStatus: d.signingStatus,
        signedAt:      d.signedAt,
        createdAt:     d.createdAt,
        user:          d.user,
        property:      d.property,
        downloadUrl:   await presignDownload(d.s3Key),
      })),
    );

    const summary = {
      total:    docs.length,
      signed:   docs.filter((d) => d.signingStatus === 'signed').length,
      pending:  docs.filter((d) => d.signingStatus === 'pending' || d.signingStatus === 'sent').length,
      declined: docs.filter((d) => d.signingStatus === 'declined').length,
    };

    res.json({ data, summary });
  } catch (err) {
    console.error('GET /api/agreements error:', err);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
});

export default router;
