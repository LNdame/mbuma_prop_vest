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

export default router;
