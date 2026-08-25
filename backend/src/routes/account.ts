import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function accountDto(u: { id: string; fullName: string; email: string; phone: string | null; role: string }) {
  return { id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role };
}

/* ── GET /api/account ── the signed-in user's own profile ───────────── */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ data: accountDto(user) });
  } catch (err) {
    console.error('GET /api/account error:', err);
    res.status(500).json({ error: 'Failed to load account' });
  }
});

/* ── PUT /api/account ── update name / phone / email ────────────────── */
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const b = req.body as { fullName?: unknown; phone?: unknown; email?: unknown };
  const fields: Record<string, string> = {};

  const fullName = typeof b.fullName === 'string' ? b.fullName.trim() : '';
  if (fullName.length < 2 || fullName.length > 120) fields.fullName = 'Enter your name (2–120 characters).';

  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) fields.email = 'Enter a valid email address.';

  let phone: string | null = null;
  if (b.phone != null && b.phone !== '') {
    phone = String(b.phone).trim();
    if (phone.length > 30) fields.phone = 'Phone number is too long.';
  }

  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: 'Some details are invalid.', fields });
    return;
  }

  try {
    // Email must stay unique across users.
    const clash = await prisma.user.findFirst({ where: { email, id: { not: req.user!.sub } }, select: { id: true } });
    if (clash) {
      res.status(409).json({ error: 'Some details are invalid.', fields: { email: 'That email is already in use.' } });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data:  { fullName, email, phone },
    });
    res.json({ data: accountDto(user) });
  } catch (err) {
    console.error('PUT /api/account error:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

/* ── PUT /api/account/password ── change own password ───────────────── */
router.put('/password', requireAuth, async (req: AuthRequest, res: Response) => {
  const b = req.body as { currentPassword?: unknown; newPassword?: unknown };
  const currentPassword = typeof b.currentPassword === 'string' ? b.currentPassword : '';
  const newPassword = typeof b.newPassword === 'string' ? b.newPassword : '';
  const fields: Record<string, string> = {};

  if (!currentPassword) fields.currentPassword = 'Enter your current password.';
  if (newPassword.length < 8) fields.newPassword = 'Use at least 8 characters.';
  if (currentPassword && newPassword && currentPassword === newPassword) {
    fields.newPassword = 'Choose a password different from your current one.';
  }
  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: 'Could not change password.', fields });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      res.status(400).json({ error: 'Could not change password.', fields: { currentPassword: 'Current password is incorrect.' } });
      return;
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ data: { ok: true } });
  } catch (err) {
    console.error('PUT /api/account/password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
