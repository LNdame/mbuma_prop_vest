import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

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

/* ── POST /api/distributions ─────────────────────────────────────────
   Create a distribution run for a property.
   Body: { propertyId, periodLabel, totalAmount, notes? }
   Splits totalAmount pro-rata across confirmed pledges, deducts 15%
   withholding tax per line, and records a DistributionLine per pledge.
──────────────────────────────────────────────────────────────────────── */
const WITHHOLDING_TAX_RATE = 0.15;

router.post('/', requireAuth, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  const { propertyId, periodLabel, totalAmount, notes } = req.body as {
    propertyId: string;
    periodLabel: string;
    totalAmount: number;
    notes?: string;
  };

  if (!propertyId || !periodLabel || !totalAmount || totalAmount <= 0) {
    res.status(400).json({ error: 'propertyId, periodLabel, and a positive totalAmount are required.' });
    return;
  }

  try {
    const pledges = await prisma.pledge.findMany({
      where: { propertyId, status: 'confirmed' },
      select: { id: true, userId: true, amount: true },
    });

    if (pledges.length === 0) {
      res.status(422).json({ error: 'No confirmed pledges found for this property.' });
      return;
    }

    const totalPledged = pledges.reduce((sum, p) => sum + Number(p.amount), 0);
    const createdBy = req.user!.sub;

    const dist = await prisma.distribution.create({
      data: {
        property:  { connect: { id: propertyId } },
        creator:   { connect: { id: createdBy } },
        totalAmount,
        periodLabel,
        notes,
        status: 'draft',
      },
    });

    const lines = pledges.map((pledge) => {
      const share = Number(pledge.amount) / totalPledged;
      const gross = parseFloat((totalAmount * share).toFixed(2));
      const tax   = parseFloat((gross * WITHHOLDING_TAX_RATE).toFixed(2));
      const net   = parseFloat((gross - tax).toFixed(2));
      return {
        distributionId: dist.id,
        userId:         pledge.userId,
        pledgeId:       pledge.id,
        grossAmount:    gross,
        withholdingTax: tax,
        netAmount:      net,
        paymentStatus:  'pending' as const,
      };
    });

    await prisma.distributionLine.createMany({ data: lines });

    res.status(201).json({ id: dist.id });
  } catch (err) {
    console.error('POST /api/distributions error:', err);
    res.status(500).json({ error: 'Failed to create distribution.' });
  }
});

/* ── PATCH /api/distributions/:id/lines/:lineId ──────────────────────
   Mark an individual line as paid or failed.
   Body: { status: 'paid' | 'failed' }
   If all lines are now paid, auto-completes the distribution.
──────────────────────────────────────────────────────────────────────── */
router.patch('/:id/lines/:lineId', requireAuth, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  const { id, lineId } = req.params;
  const { status } = req.body as { status: 'paid' | 'failed' };

  if (!['paid', 'failed'].includes(status)) {
    res.status(400).json({ error: 'status must be paid or failed' });
    return;
  }

  try {
    await prisma.distributionLine.update({
      where: { id: lineId, distributionId: id },
      data: {
        paymentStatus: status,
        paidAt: status === 'paid' ? new Date() : null,
      },
    });

    const allLines = await prisma.distributionLine.findMany({
      where: { distributionId: id },
      select: { paymentStatus: true },
    });
    const allPaid = allLines.every((l) => l.paymentStatus === 'paid');
    if (allPaid) {
      await prisma.distribution.update({
        where: { id },
        data: { status: 'completed', processedAt: new Date() },
      });
    }

    res.json({ ok: true, completed: allPaid });
  } catch (err) {
    console.error('PATCH /api/distributions/:id/lines/:lineId error:', err);
    res.status(500).json({ error: 'Failed to update line' });
  }
});

/* ── PATCH /api/distributions/:id/mark-all-paid ──────────────────────
   Mark all pending lines as paid and complete the distribution.
──────────────────────────────────────────────────────────────────────── */
router.patch('/:id/mark-all-paid', requireAuth, requireRole('admin', 'super_admin'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date();
    await prisma.distributionLine.updateMany({
      where: { distributionId: id, paymentStatus: 'pending' },
      data: { paymentStatus: 'paid', paidAt: now },
    });
    await prisma.distribution.update({
      where: { id },
      data: { status: 'completed', processedAt: now },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/distributions/:id/mark-all-paid error:', err);
    res.status(500).json({ error: 'Failed to mark all paid' });
  }
});

/* ── GET /api/distributions/:id ──────────────────────────────────────
   Full detail for a single distribution run including per-investor lines.
──────────────────────────────────────────────────────────────────────── */
router.get('/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res: Response) => {
  try {
    const dist = await prisma.distribution.findUnique({
      where: { id: req.params.id },
      include: {
        property: { select: { id: true, title: true } },
        creator:  { select: { fullName: true } },
        lines: {
          include: {
            user:   { select: { id: true, fullName: true, email: true } },
            pledge: { select: { amount: true } },
          },
          orderBy: { grossAmount: 'desc' },
        },
      },
    });

    if (!dist) { res.status(404).json({ error: 'Distribution not found' }); return; }

    res.json({
      id:          dist.id,
      periodLabel: dist.periodLabel,
      status:      dist.status,
      totalAmount: Number(dist.totalAmount),
      notes:       dist.notes,
      processedAt: dist.processedAt,
      createdAt:   dist.createdAt,
      property:    dist.property,
      createdBy:   dist.creator.fullName,
      lines: dist.lines.map((l) => ({
        id:             l.id,
        userId:         l.user.id,
        fullName:       l.user.fullName,
        email:          l.user.email,
        pledgeAmount:   Number(l.pledge.amount),
        grossAmount:    Number(l.grossAmount),
        withholdingTax: Number(l.withholdingTax),
        netAmount:      Number(l.netAmount),
        paymentStatus:  l.paymentStatus,
        paidAt:         l.paidAt,
      })),
    });
  } catch (err) {
    console.error('GET /api/distributions/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch distribution' });
  }
});

export default router;
