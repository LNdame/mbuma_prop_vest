import { Router, type Response } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/* ── POST /api/invitations ───────────────────────────────────────── */
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }

    // Check no active user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Expire any previous pending invitations for the same email
    await prisma.invitation.updateMany({
      where: { email, status: 'pending' },
      data:  { status: 'expired' },
    });

    const token     = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        expiresAt,
        createdBy: req.user!.sub,
      },
    });

    // In production this would trigger an email via a notification service.
    // For now we return the invite link directly so the admin can share it.
    const inviteLink = `${process.env.APP_URL ?? 'http://localhost:3000'}/invite/${token}`;

    res.status(201).json({
      data: {
        id:         invitation.id,
        email:      invitation.email,
        expiresAt:  invitation.expiresAt,
        inviteLink,
      },
    });
  }
);

/* ── GET /api/invitations ────────────────────────────────────────── */
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (_req, res: Response) => {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ data: invitations });
  }
);

export default router;
