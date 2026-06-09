import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/reports ────────────────────────────────────────────────
   Admin platform analytics aggregated from the database.
──────────────────────────────────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    const [propAgg, propByStatus, investorTotal, investorByKyc, pledgeByStatus, distAgg, topProps] =
      await Promise.all([
        prisma.property.aggregate({ _count: { _all: true }, _sum: { fundedAmount: true, targetRaise: true } }),
        prisma.property.groupBy({ by: ['status'], _count: { _all: true }, _sum: { fundedAmount: true } }),
        prisma.user.count({ where: { role: 'investor' } }),
        prisma.user.groupBy({ by: ['kycStatus'], where: { role: 'investor' }, _count: { _all: true } }),
        prisma.pledge.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
        prisma.distributionLine.aggregate({ where: { paymentStatus: 'paid' }, _sum: { netAmount: true, grossAmount: true, withholdingTax: true } }),
        prisma.property.findMany({
          orderBy: { fundedAmount: 'desc' },
          take: 5,
          select: { id: true, title: true, status: true, propertyType: true, fundedAmount: true, targetRaise: true },
        }),
      ]);

    res.json({
      totals: {
        properties:   propAgg._count._all,
        investors:    investorTotal,
        totalRaised:  Number(propAgg._sum.fundedAmount ?? 0),
        totalTarget:  Number(propAgg._sum.targetRaise ?? 0),
      },
      distributions: {
        gross: Number(distAgg._sum.grossAmount ?? 0),
        tax:   Number(distAgg._sum.withholdingTax ?? 0),
        net:   Number(distAgg._sum.netAmount ?? 0),
      },
      propertiesByStatus: propByStatus.map((p) => ({
        status: p.status,
        count:  p._count._all,
        raised: Number(p._sum.fundedAmount ?? 0),
      })),
      investorsByKyc: investorByKyc.map((u) => ({
        kycStatus: u.kycStatus,
        count:     u._count._all,
      })),
      pledgesByStatus: pledgeByStatus.map((p) => ({
        status: p.status,
        count:  p._count._all,
        amount: Number(p._sum.amount ?? 0),
      })),
      topProperties: topProps.map((p) => ({
        id:           p.id,
        title:        p.title,
        status:       p.status,
        propertyType: p.propertyType,
        fundedAmount: Number(p.fundedAmount),
        targetRaise:  Number(p.targetRaise),
      })),
    });
  } catch (err) {
    console.error('GET /api/reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
