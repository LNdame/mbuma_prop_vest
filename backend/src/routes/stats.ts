import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/* ── GET /api/stats ──────────────────────────────────────────────────
   Public platform figures for the landing page stats bar.
──────────────────────────────────────────────────────────────────────── */
router.get('/', async (_req, res: Response) => {
  try {
    const [propertiesListed, agg, verifiedInvestors] = await Promise.all([
      prisma.property.count({ where: { status: { not: 'draft' } } }),
      prisma.property.aggregate({
        where: { status: { not: 'draft' } },
        _sum: { fundedAmount: true },
        _avg: { projectedYieldPct: true },
      }),
      prisma.user.count({ where: { role: 'investor', kycStatus: 'approved' } }),
    ]);

    res.json({
      propertiesListed,
      totalRaised:       Number(agg._sum.fundedAmount ?? 0),
      avgYieldPct:       Number(agg._avg.projectedYieldPct ?? 0),
      verifiedInvestors,
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
