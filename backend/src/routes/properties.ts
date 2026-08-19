import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { presignDownload } from '../lib/storage.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/properties ─────────────────────────────────────────── */
router.get('/', async (_req, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { pledges: true } },
        images: { take: 1, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    const data = await Promise.all(
      properties.map(async ({ _count, images, ...p }) => ({
        ...p,
        investorCount:  _count.pledges,
        coverImageUrl:  images[0] ? await presignDownload(images[0].s3Key) : null,
      })),
    );

    res.json({ data });
  } catch (err) {
    console.error('GET /api/properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

/* ── GET /api/properties/:id ─────────────────────────────────────── */
router.get('/:id', async (req, res: Response) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        pledges: {
          where:   { status: { not: 'cancelled' } },
          include: { user: { select: { id: true, fullName: true, email: true, kycStatus: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ data: property });
  } catch (err) {
    console.error('GET /api/properties/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

/* ── POST /api/properties ────────────────────────────────────────── */
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const body = req.body as Record<string, unknown>;

    const property = await prisma.property.create({
      data: {
        createdBy:                String(body.createdBy ?? req.user!.sub),
        title:                    String(body.title),
        propertyType:             body.propertyType as 'residential' | 'commercial' | 'mixed_use',
        address:                  String(body.address),
        province:                 String(body.province),
        purchasePrice:            Number(body.purchasePrice),
        targetRaise:              Number(body.targetRaise),
        minimumPledge:            Number(body.minimumPledge),
        grossMonthlyRent:         Number(body.grossMonthlyRent),
        operatingExpensesMonthly: Number(body.operatingExpensesMonthly),
        netMonthlyRent:           Number(body.netMonthlyRent),
        projectedYieldPct:        Number(body.projectedYieldPct),
        loanAmount:               body.loanAmount    ? Number(body.loanAmount)    : null,
        loanInterestRate:         body.loanInterestRate ? Number(body.loanInterestRate) : null,
        loanTermMonths:           body.loanTermMonths   ? Number(body.loanTermMonths)   : null,
        status:                   (body.status as 'draft' | 'open' | 'funded' | 'closed') ?? 'draft',
        fundingCloseDate:         body.fundingCloseDate ? new Date(String(body.fundingCloseDate)) : null,
      },
    });

    res.status(201).json({ data: property });
  }
);

/* ── PATCH /api/properties/:id ───────────────────────────────────── */
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const body = req.body as Record<string, unknown>;

    // Build update payload — only include fields that are explicitly provided
    const data: Record<string, unknown> = {};
    const str  = (k: string) => { if (body[k] !== undefined) data[k] = String(body[k]); };
    const num  = (k: string) => { if (body[k] !== undefined) data[k] = Number(body[k]); };
    const opt  = (k: string) => { if (body[k] !== undefined) data[k] = body[k] ? Number(body[k]) : null; };

    str('title'); str('propertyType'); str('address'); str('province'); str('status');
    num('purchasePrice'); num('targetRaise'); num('minimumPledge');
    num('grossMonthlyRent'); num('operatingExpensesMonthly'); num('netMonthlyRent');
    num('projectedYieldPct');
    opt('loanAmount'); opt('loanInterestRate');
    if (body.loanTermMonths !== undefined) data.loanTermMonths = body.loanTermMonths ? Number(body.loanTermMonths) : null;
    if (body.fundingCloseDate !== undefined) data.fundingCloseDate = body.fundingCloseDate ? new Date(String(body.fundingCloseDate)) : null;

    try {
      const property = await prisma.property.update({
        where: { id: req.params.id },
        data,
      });
      res.json({ data: property });
    } catch {
      res.status(404).json({ error: 'Property not found' });
    }
  }
);

/* ── POST /api/properties/:id/pledges ────────────────────────────────
   An investor pledges into an open property. The pledge is created as
   'pending' and reserves the investor's available funds (direct deposits +
   net distribution income − active pledges). Validated in one transaction.
──────────────────────────────────────────────────────────────────────── */
router.post(
  '/:id/pledges',
  requireAuth,
  requireRole('investor'),
  async (req: AuthRequest, res: Response) => {
    const rand = (n: number) => 'R' + n.toLocaleString('en-ZA');

    const amount = Number((req.body as { amount?: number | string }).amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'A positive pledge amount is required' });
      return;
    }

    const property = await prisma.property.findUnique({
      where:  { id: req.params.id },
      select: { id: true, status: true, minimumPledge: true, targetRaise: true, fundedAmount: true },
    });
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    if (property.status !== 'open') {
      res.status(409).json({ error: 'This property is not open for pledges' });
      return;
    }

    const minPledge = Number(property.minimumPledge);
    if (amount < minPledge) {
      res.status(400).json({ error: `The minimum pledge for this property is ${rand(minPledge)}` });
      return;
    }

    const remaining = Number(property.targetRaise) - Number(property.fundedAmount);
    if (amount > remaining) {
      res.status(400).json({ error: `Only ${rand(remaining)} remaining on this property's target raise` });
      return;
    }

    // Available funds = direct deposits + net distribution income − amount reserved by active (pending/confirmed) pledges.
    const [allocAgg, pledgeAgg, distAgg] = await Promise.all([
      prisma.fundAllocation.aggregate({ where: { userId: req.user!.sub }, _sum: { amount: true } }),
      prisma.pledge.aggregate({ where: { userId: req.user!.sub, status: { not: 'cancelled' } }, _sum: { amount: true } }),
      prisma.distributionLine.aggregate({ where: { userId: req.user!.sub, paymentStatus: 'paid' }, _sum: { netAmount: true } }),
    ]);
    const availableFunds = Number(allocAgg._sum.amount ?? 0)
                         + Number(distAgg._sum.netAmount ?? 0)
                         - Number(pledgeAgg._sum.amount ?? 0);
    if (amount > availableFunds) {
      res.status(400).json({ error: `Insufficient available funds — you have ${rand(availableFunds)} available` });
      return;
    }

    const pledge = await prisma.$transaction(async (tx) => {
      const created = await tx.pledge.create({
        data: { userId: req.user!.sub, propertyId: property.id, amount, status: 'pending' },
      });
      const newFunded = Number(property.fundedAmount) + amount;
      await tx.property.update({
        where: { id: property.id },
        data: {
          fundedAmount: newFunded,
          // Auto-close the raise once the target is reached.
          ...(newFunded >= Number(property.targetRaise) ? { status: 'funded' as const } : {}),
        },
      });
      return created;
    });

    res.status(201).json({ data: { pledge, availableFunds: availableFunds - amount } });
  }
);

export default router;
