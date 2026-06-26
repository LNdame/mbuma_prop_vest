import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { presignDownload } from '../lib/storage.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* Net rental income credited to an investor via allocated (paid) distribution
   lines. This becomes spendable account credit alongside direct deposits. */
async function allocatedDistributionTotal(userId: string): Promise<number> {
  const agg = await prisma.distributionLine.aggregate({
    where: { userId, paymentStatus: 'paid' },
    _sum: { netAmount: true },
  });
  return Number(agg._sum.netAmount ?? 0);
}

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

    // Net distribution income credited per investor, summed in one query to avoid N+1.
    const distSums = await prisma.distributionLine.groupBy({
      by: ['userId'],
      where: { paymentStatus: 'paid', userId: { in: investors.map((u) => u.id) } },
      _sum: { netAmount: true },
    });
    const distByUser = new Map(distSums.map((d) => [d.userId, Number(d._sum.netAmount ?? 0)]));

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
      // Available funds = direct deposits + net distribution income − amount reserved by active (pending/confirmed) pledges.
      availableFunds: u.fundAllocations.reduce((sum, a) => sum + Number(a.amount), 0)
                    + (distByUser.get(u.id) ?? 0)
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

    // Available funds = direct deposits + net distribution income − amount reserved by active (pending/confirmed) pledges.
    // user.pledges is already filtered to status != 'cancelled' above. Distribution income is summed
    // separately (not from user.distributionLines, which is take-limited for display).
    const deposits     = user.fundAllocations.reduce((s, a) => s + Number(a.amount), 0);
    const reserved     = user.pledges.reduce((s, p) => s + Number(p.amount), 0);
    const distributions = await allocatedDistributionTotal(user.id);
    const availableFunds = deposits + distributions - reserved;
    const fundsBreakdown = { deposits, distributions, reserved };

    const { passwordHash: _omit, documents: _docs, ...safe } = user;
    res.json({ data: { ...safe, documents, availableFunds, fundsBreakdown } });
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
        documents: {
          where:   { docType: { in: ['id_document', 'selfie_with_id', 'proof_of_address'] } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || user.role === 'admin' || user.role === 'super_admin') {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Sign each KYC document so the admin can open it for review.
    const kycDocuments = await Promise.all(
      user.documents.map(async (d) => ({
        id: d.id, docType: d.docType, fileName: d.fileName, mimeType: d.mimeType,
        createdAt: d.createdAt, downloadUrl: await presignDownload(d.s3Key),
      })),
    );

    // Available funds = direct deposits + net distribution income − amount reserved by active (pending/confirmed) pledges.
    const deposits      = user.fundAllocations.reduce((s, a) => s + Number(a.amount), 0);
    const reserved      = user.pledges.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + Number(p.amount), 0);
    const distributions = await allocatedDistributionTotal(user.id);
    const availableFunds = deposits + distributions - reserved;
    const fundsBreakdown = { deposits, distributions, reserved };
    const { documents: _rawDocs, ...safe } = user;
    res.json({ data: { ...safe, kycDocuments, availableFunds, fundsBreakdown } });
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

    // Available funds = direct deposits + net distribution income − amount reserved by active (pending/confirmed) pledges.
    const [allocAgg, pledgeAgg, distAgg] = await Promise.all([
      prisma.fundAllocation.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
      prisma.pledge.aggregate({ where: { userId: user.id, status: { not: 'cancelled' } }, _sum: { amount: true } }),
      prisma.distributionLine.aggregate({ where: { userId: user.id, paymentStatus: 'paid' }, _sum: { netAmount: true } }),
    ]);
    const availableFunds = Number(allocAgg._sum.amount ?? 0)
                         + Number(distAgg._sum.netAmount ?? 0)
                         - Number(pledgeAgg._sum.amount ?? 0);
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
