import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/investors ──────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  const investors = await prisma.user.findMany({
    where: { role: 'investor' },
    orderBy: { createdAt: 'desc' },
    include: {
      investorProfile: true,
      pledges: {
        where: { status: { not: 'cancelled' } },
        include: { property: { select: { id: true, title: true, status: true } } },
      },
    },
  });

  const data = investors.map((u) => ({
    id:           u.id,
    fullName:     u.fullName,
    email:        u.email,
    phone:        u.phone,
    kycStatus:    u.kycStatus,
    kycVerifiedAt: u.kycVerifiedAt,
    isActive:     u.isActive,
    createdAt:    u.createdAt,
    profile:      u.investorProfile,
    pledges:      u.pledges,
    totalInvested: u.pledges
      .filter((p) => p.status === 'confirmed')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    propertyCount: new Set(u.pledges.map((p) => p.propertyId)).size,
  }));

  res.json({ data });
});

/* ── GET /api/investors/:id ──────────────────────────────────────── */
router.get('/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      investorProfile: true,
      pledges: {
        include: {
          property: { select: { id: true, title: true, propertyType: true, status: true, projectedYieldPct: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      distributionLines: {
        include: { distribution: { select: { periodLabel: true, processedAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      },
    },
  });

  if (!user || user.role === 'admin' || user.role === 'super_admin') {
    res.status(404).json({ error: 'Investor not found' });
    return;
  }

  res.json({ data: user });
});

/* ── POST /api/investors/:id/verify ─────────────────────────────── */
router.post(
  '/:id/verify',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.update({
        where: { id: _req.params.id },
        data: { kycStatus: 'approved', kycVerifiedAt: new Date() },
      });
      res.json({ data: { id: user.id, kycStatus: user.kycStatus } });
    } catch {
      res.status(404).json({ error: 'Investor not found' });
    }
  }
);

export default router;
