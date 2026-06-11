import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* ── POST /api/pledges/:id/cancel ─────────────────────────────────────
   Cancel a pending pledge and release the funds it reserved.

   - The pledge owner (investor) or an admin may cancel.
   - Only 'pending' pledges can be cancelled.
   - Not allowed once the property's funding is closed (i.e. the property
     is no longer 'open' — already 'funded' or 'closed').
──────────────────────────────────────────────────────────────────────── */
router.post('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  const pledge = await prisma.pledge.findUnique({
    where:   { id: req.params.id },
    include: { property: { select: { id: true, status: true, fundedAmount: true } } },
  });
  if (!pledge) {
    res.status(404).json({ error: 'Pledge not found' });
    return;
  }

  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const isOwner = pledge.userId === req.user!.sub;
  if (!isAdmin && !isOwner) {
    res.status(403).json({ error: 'You can only cancel your own pledges' });
    return;
  }

  if (pledge.status !== 'pending') {
    res.status(409).json({ error: `Only pending pledges can be cancelled (this pledge is ${pledge.status})` });
    return;
  }

  if (pledge.property.status !== 'open') {
    res.status(409).json({ error: 'This pledge can no longer be cancelled — the property funding is closed' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.pledge.update({ where: { id: pledge.id }, data: { status: 'cancelled' } });
    // Release the reserved amount from the property's funded total.
    const newFunded = Math.max(0, Number(pledge.property.fundedAmount) - Number(pledge.amount));
    await tx.property.update({ where: { id: pledge.property.id }, data: { fundedAmount: newFunded } });
  });

  // Recompute the pledge owner's available funds for the response.
  const [allocAgg, pledgeAgg] = await Promise.all([
    prisma.fundAllocation.aggregate({ where: { userId: pledge.userId }, _sum: { amount: true } }),
    prisma.pledge.aggregate({ where: { userId: pledge.userId, status: { not: 'cancelled' } }, _sum: { amount: true } }),
  ]);
  const availableFunds = Number(allocAgg._sum.amount ?? 0) - Number(pledgeAgg._sum.amount ?? 0);

  res.json({ data: { id: pledge.id, status: 'cancelled', availableFunds } });
});

export default router;
