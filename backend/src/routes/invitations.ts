import { Router, type Response } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';
import { signJwt } from '../lib/jwt.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { getSettings } from '../lib/settings.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── POST /api/invitations/request ───────────────────────────────────
   PUBLIC — a prospective investor requests an invitation from the
   landing page. Always responds 200 (no account-enumeration leak).
──────────────────────────────────────────────────────────────────────── */
router.post('/request', async (req, res: Response) => {
  const { email, fullName } = req.body as { email?: string; fullName?: string };
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }
  const normalized = email.trim().toLowerCase();

  try {
    const [existingUser, existingRequest] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalized } }),
      prisma.invitationRequest.findFirst({ where: { email: normalized, status: 'pending' } }),
    ]);

    // Only record a new request if there's no account and no pending request already.
    if (!existingUser && !existingRequest) {
      await prisma.invitationRequest.create({
        data: { email: normalized, fullName: fullName?.trim() || null },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/invitations/request error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/* ── GET /api/invitations/requests ──────────────────────────────────
   Admin — list public invitation requests.
──────────────────────────────────────────────────────────────────────── */
router.get(
  '/requests',
  requireAuth,
  requireRole('admin', 'super_admin'),
  async (_req, res: Response) => {
    const data = await prisma.invitationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ data });
  },
);

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
    const { invitationExpiryDays } = await getSettings();
    const expiresAt = new Date(Date.now() + invitationExpiryDays * 24 * 60 * 60 * 1000);

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

/* ── GET /api/invitations/:token ─────────────────────────────────────
   PUBLIC — validate an invite link and return the invited email.
   (Declared after /requests so the literal route wins.)
──────────────────────────────────────────────────────────────────────── */
router.get('/:token', async (req, res: Response) => {
  const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
  if (!inv || inv.status !== 'pending') {
    res.status(404).json({ error: 'This invitation is invalid or has already been used.' });
    return;
  }
  if (inv.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: inv.id }, data: { status: 'expired' } });
    res.status(410).json({ error: 'This invitation has expired.' });
    return;
  }
  res.json({ data: { email: inv.email, expiresAt: inv.expiresAt } });
});

/* ── POST /api/invitations/:token/accept ─────────────────────────────
   PUBLIC — an invited person creates their account (investor role).
   Body: { fullName, password, phone? }. Returns a JWT for auto-login.
──────────────────────────────────────────────────────────────────────── */
router.post('/:token/accept', async (req, res: Response) => {
  const { fullName, password, phone } = req.body as { fullName?: string; password?: string; phone?: string };

  if (!fullName?.trim()) {
    res.status(400).json({ error: 'Full name is required' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
  if (!inv || inv.status !== 'pending') {
    res.status(404).json({ error: 'This invitation is invalid or has already been used.' });
    return;
  }
  if (inv.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: inv.id }, data: { status: 'expired' } });
    res.status(410).json({ error: 'This invitation has expired.' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: inv.email } });
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email:        inv.email,
        passwordHash,
        fullName:     fullName.trim(),
        phone:        phone?.trim() || null,
        role:         'investor',
      },
    });
    await tx.invitation.update({ where: { id: inv.id }, data: { status: 'accepted', acceptedAt: new Date() } });
    await tx.invitationRequest.updateMany({ where: { email: inv.email, status: 'pending' }, data: { status: 'invited' } });
    return created;
  });

  const secret = process.env.JWT_SECRET!;
  const token = signJwt({ sub: user.id, email: user.email, role: user.role }, secret);

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, kycStatus: user.kycStatus },
  });
});

export default router;
