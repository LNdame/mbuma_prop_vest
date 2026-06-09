import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/distributions ──────────────────────────────────────────
   Admin list of distributions with per-run aggregates + a summary.
──────────────────────────────────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    const distributions = await prisma.distribution.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { id: true, title: true } },
        lines: { select: { userId: true, grossAmount: true, netAmount: true, paymentStatus: true } },
      },
    });

    const data = distributions.map((d) => {
      const gross = d.lines.reduce((s, l) => s + Number(l.grossAmount), 0);
      const net   = d.lines.reduce((s, l) => s + Number(l.netAmount), 0);
      const paid  = d.lines.filter((l) => l.paymentStatus === 'paid').length;
      return {
        id:          d.id,
        periodLabel: d.periodLabel,
        status:      d.status,
        processedAt: d.processedAt,
        createdAt:   d.createdAt,
        property:    d.property,
        totalAmount: Number(d.totalAmount),
        gross,
        net,
        recipients:  new Set(d.lines.map((l) => l.userId)).size,
        lineCount:   d.lines.length,
        paidCount:   paid,
      };
    });

    const year = new Date().getFullYear();
    let totalNet = 0, ytdNet = 0;
    const recipientIds = new Set<string>();
    for (const d of distributions) {
      for (const l of d.lines) {
        const n = Number(l.netAmount);
        totalNet += n;
        recipientIds.add(l.userId);
        if (d.processedAt && new Date(d.processedAt).getFullYear() === year) ytdNet += n;
      }
    }
    const lastCompleted = distributions.find((d) => d.status === 'completed');

    res.json({
      data,
      summary: {
        totalDistributed: totalNet,
        ytdDistributed:   ytdNet,
        runCount:         distributions.length,
        recipientCount:   recipientIds.size,
        lastAmount:       lastCompleted ? Number(lastCompleted.totalAmount) : 0,
        lastDate:         lastCompleted?.processedAt ?? null,
      },
    });
  } catch (err) {
    console.error('GET /api/distributions error:', err);
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
});

export default router;
