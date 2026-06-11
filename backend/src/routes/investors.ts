import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { presignDownload } from '../lib/storage.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/investors ──────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    const investors = await prisma.user.findMany({
      where: { role: 'investor' },
      orderBy: { createdAt: 'desc' },
      include: {
        investorProfile: true,
        pledges: {
          where: { status: { not: 'cancelled' } },
          include: { property: { select: { id: true, title: true, status: true } } },
        },
        fundAllocations: { select: { amount: true } },
      },
    });

    const data = investors.map((u) => ({
      id:            u.id,
      fullName:      u.fullName,
      email:         u.email,
      phone:         u.phone,
      kycStatus:     u.kycStatus,
      kycVerifiedAt: u.kycVerifiedAt,
      isActive:      u.isActive,
      createdAt:     u.createdAt,
      profile:       u.investorProfile,
      pledges:       u.pledges,
      totalInvested: u.pledges
        .filter((p) => p.status === 'confirmed')
        .reduce((sum, p) => sum + Number(p.amount), 0),
      propertyCount: new Set(u.pledges.map((p) => p.propertyId)).size,
      // Available funds = allocations received − amount reserved by active (pending/confirmed) pledges.
      availableFunds: u.fundAllocations.reduce((sum, a) => sum + Number(a.amount), 0)
                    - u.pledges.reduce((sum, p) => sum + Number(p.amount), 0),
    }));

    res.json({ data });
  } catch (err) {
    console.error('GET /api/investors error:', err);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

/* ── GET /api/investors/me ───────────────────────────────────────────
   The logged-in investor's own profile, pledges and distributions.
   Must be declared BEFORE /:id so "me" isn't treated as an id.
──────────────────────────────────────────────────────────────────────── */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: {
        investorProfile: true,
        pledges: {
          where:   { status: { not: 'cancelled' } },
          include: {
            property: { select: { id: true, title: true, propertyType: true, address: true, province: true, status: true, projectedYieldPct: true, targetRaise: true, fundedAmount: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        distributionLines: {
          include: { distribution: { select: { periodLabel: true, processedAt: true, property: { select: { title: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 24,
        },
        documents: {
          include: { property: { select: { title: true } } },
          orderBy: { createdAt: 'desc' },
        },
        fundAllocations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    // Sign each document for direct download
    const documents = await Promise.all(
      user.documents.map(async (d) => ({ ...d, downloadUrl: await presignDownload(d.s3Key) })),
    );

    // Available funds = allocations received − amount reserved by active (pending/confirmed) pledges.
    // user.pledges is already filtered to status != 'cancelled' above.
    const availableFunds = user.fundAllocations.reduce((s, a) => s + Number(a.amount), 0)
                         - user.pledges.reduce((s, p) => s + Number(p.amount), 0);

    const { passwordHash: _omit, documents: _docs, ...safe } = user;
    res.json({ data: { ...safe, documents, availableFunds } });
  } catch (err) {
    console.error('GET /api/investors/me error:', err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

/* ── GET /api/investors/:id ──────────────────────────────────────── */
router.get('/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res: Response) => {
  try {
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
        fundAllocations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user || user.role === 'admin' || user.role === 'super_admin') {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Available funds = allocations received − amount reserved by active (pending/confirmed) pledges.
    const availableFunds = user.fundAllocations.reduce((s, a) => s + Number(a.amount), 0)
                         - user.pledges.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + Number(p.amount), 0);
    res.json({ data: { ...user, availableFunds } });
  } catch (err) {
    console.error('GET /api/investors/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch investor' });
  }
});

/* ── POST /api/investors/:id/allocate ───────────────────────────────
   Admin records funds received from an investor and credits their
   account. Available funds = sum of allocations.
──────────────────────────────────────────────────────────────────────── */
router.post(
  '/:id/allocate',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { amount, reference, note } = req.body as { amount?: number | string; reference?: string; note?: string };
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      res.status(400).json({ error: 'A positive amount is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true } });
    if (!user || user.role !== 'investor') {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    const allocation = await prisma.fundAllocation.create({
      data: {
        userId:    user.id,
        amount:    amt,
        reference: reference?.trim() || null,
        note:      note?.trim() || null,
        createdBy: req.user!.sub,
      },
    });

    // Available funds = allocations received − amount reserved by active (pending/confirmed) pledges.
    const [allocAgg, pledgeAgg] = await Promise.all([
      prisma.fundAllocation.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
      prisma.pledge.aggregate({ where: { userId: user.id, status: { not: 'cancelled' } }, _sum: { amount: true } }),
    ]);
    const availableFunds = Number(allocAgg._sum.amount ?? 0) - Number(pledgeAgg._sum.amount ?? 0);
    res.status(201).json({ data: { allocation, availableFunds } });
  },
);

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
