import { Router, type Response } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { invalidateSettings, getSettings } from '../lib/settings.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_ROLES = ['admin', 'super_admin'] as const;

/* The public site URL is normally a deployment variable (APP_URL). When it is
   set, it wins over any stored value and the field is read-only in the UI. */
function appUrlLocked(): boolean {
  return !!process.env.APP_URL;
}

interface SettingsDto {
  withholdingTaxPct: number;     // 0–100 (stored as a fraction)
  invitationExpiryDays: number;
  sessionHours: number;
  defaultMinPledge: number;
  supportEmail: string | null;
  publicSiteUrl: string | null;
  publicSiteUrlLocked: boolean;
  eurPerZar: number;             // EUR value of 1 ZAR (admin-managed FX rate)
  ratesUpdatedAt: string | null;
  updatedAt: Date | null;
}

async function readDto(): Promise<SettingsDto> {
  const row = await prisma.settings.findUnique({ where: { id: 1 } });
  return {
    withholdingTaxPct: row ? Number(row.withholdingTaxRate) * 100 : 15,
    invitationExpiryDays: row?.invitationExpiryDays ?? 7,
    sessionHours: row?.sessionHours ?? 24,
    defaultMinPledge: row ? Number(row.defaultMinPledge) : 1000,
    supportEmail: row?.supportEmail ?? null,
    publicSiteUrl: process.env.APP_URL ?? row?.publicSiteUrl ?? null,
    publicSiteUrlLocked: appUrlLocked(),
    eurPerZar: row ? Number(row.eurPerZar) : 0.05,
    ratesUpdatedAt: row?.ratesUpdatedAt ? row.ratesUpdatedAt.toISOString() : null,
    updatedAt: row?.updatedAt ?? null,
  };
}

/* ── GET /api/settings ── any admin may read ───────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    res.json({ data: await readDto() });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

/* ── PUT /api/settings ── super admin only ─────────────────────────── */
router.put('/', requireAuth, requireRole('super_admin'), async (req: AuthRequest, res: Response) => {
  const b = req.body as Partial<Record<keyof SettingsDto, unknown>>;
  const fields: Record<string, string> = {};

  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

  const taxPct = num(b.withholdingTaxPct);
  if (Number.isNaN(taxPct) || taxPct < 0 || taxPct > 100) fields.withholdingTaxPct = 'Enter a percentage between 0 and 100.';

  const expiry = num(b.invitationExpiryDays);
  if (!Number.isInteger(expiry) || expiry < 1 || expiry > 90) fields.invitationExpiryDays = 'Enter a whole number of days between 1 and 90.';

  const session = num(b.sessionHours);
  if (!Number.isInteger(session) || session < 1 || session > 720) fields.sessionHours = 'Enter a whole number of hours between 1 and 720.';

  const minPledge = num(b.defaultMinPledge);
  if (Number.isNaN(minPledge) || minPledge < 0 || minPledge > 100_000_000) fields.defaultMinPledge = 'Enter an amount of R0 or more.';

  let supportEmail: string | null = null;
  if (b.supportEmail != null && b.supportEmail !== '') {
    supportEmail = String(b.supportEmail).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) fields.supportEmail = 'Enter a valid email address.';
  }

  // publicSiteUrl is only writable when not locked by the APP_URL deploy var.
  let publicSiteUrl: string | null = null;
  if (!appUrlLocked() && b.publicSiteUrl != null && b.publicSiteUrl !== '') {
    publicSiteUrl = String(b.publicSiteUrl).trim();
    try { new URL(publicSiteUrl); } catch { fields.publicSiteUrl = 'Enter a valid URL, e.g. https://mbumapropvest.com'; }
  }

  const eurPerZar = num(b.eurPerZar);
  if (Number.isNaN(eurPerZar) || eurPerZar <= 0 || eurPerZar > 100) fields.eurPerZar = 'Enter the EUR value of 1 ZAR (greater than 0).';

  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: 'Some settings are invalid.', fields });
    return;
  }

  try {
    // Stamp ratesUpdatedAt only when the FX rate actually changes.
    const current = await prisma.settings.findUnique({ where: { id: 1 }, select: { eurPerZar: true } });
    const rateChanged = !current || Number(current.eurPerZar) !== eurPerZar;

    const data = {
      withholdingTaxRate: taxPct / 100,
      invitationExpiryDays: expiry,
      sessionHours: session,
      defaultMinPledge: minPledge,
      supportEmail,
      eurPerZar,
      updatedBy: req.user!.sub,
      ...(rateChanged ? { ratesUpdatedAt: new Date() } : {}),
      ...(appUrlLocked() ? {} : { publicSiteUrl }),
    };
    await prisma.settings.upsert({
      where:  { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    invalidateSettings();
    res.json({ data: await readDto() });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

/* ── Team & Roles (super admin only) ────────────────────────────────
   Manage who can administer PropVest: list administrators, invite a new
   one, change a role, or activate/deactivate an account.
──────────────────────────────────────────────────────────────────────── */

/* GET /api/settings/admins — administrators + pending admin invitations */
router.get('/admins', requireAuth, requireRole('super_admin'), async (_req, res: Response) => {
  try {
    const [admins, pendingInvites] = await Promise.all([
      prisma.user.findMany({
        where:   { role: { in: ['admin', 'super_admin'] } },
        select:  { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.invitation.findMany({
        where:   { role: { in: ['admin', 'super_admin'] }, status: 'pending' },
        select:  { id: true, email: true, role: true, expiresAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    res.json({ data: { admins, pendingInvites } });
  } catch (err) {
    console.error('GET /api/settings/admins error:', err);
    res.status(500).json({ error: 'Failed to load administrators' });
  }
});

/* POST /api/settings/admins/invite — invite a new administrator */
router.post('/admins/invite', requireAuth, requireRole('super_admin'), async (req: AuthRequest, res: Response) => {
  const b = req.body as { email?: unknown; role?: unknown };
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const role = b.role === 'super_admin' ? 'super_admin' : 'admin';

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required.', fields: { email: 'Enter a valid email address.' } });
    return;
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.', fields: { email: 'That email already has an account.' } });
      return;
    }
    // Supersede any earlier pending invitation for the same email.
    await prisma.invitation.updateMany({ where: { email, status: 'pending' }, data: { status: 'expired' } });

    const token = randomBytes(32).toString('hex');
    const { invitationExpiryDays } = await getSettings();
    const expiresAt = new Date(Date.now() + invitationExpiryDays * 24 * 60 * 60 * 1000);
    const inv = await prisma.invitation.create({
      data: { email, token, role, expiresAt, createdBy: req.user!.sub },
    });
    const inviteLink = `${process.env.APP_URL ?? 'http://localhost:3000'}/invite/${token}`;
    res.status(201).json({ data: { id: inv.id, email, role, expiresAt: inv.expiresAt, inviteLink } });
  } catch (err) {
    console.error('POST /api/settings/admins/invite error:', err);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

/* PATCH /api/settings/admins/:id — change role and/or active status */
router.patch('/admins/:id', requireAuth, requireRole('super_admin'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const b = req.body as { role?: unknown; isActive?: unknown };

  if (id === req.user!.sub) {
    res.status(400).json({ error: 'You can’t change your own role or status.' });
    return;
  }
  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || !ADMIN_ROLES.includes(target.role as (typeof ADMIN_ROLES)[number])) {
      res.status(404).json({ error: 'Administrator not found.' });
      return;
    }

    let nextRole = target.role;
    if (b.role !== undefined) {
      if (b.role !== 'admin' && b.role !== 'super_admin') {
        res.status(400).json({ error: 'Role must be admin or super_admin.' });
        return;
      }
      nextRole = b.role;
    }
    const nextActive = typeof b.isActive === 'boolean' ? b.isActive : target.isActive;

    // Never leave the platform without an active super admin.
    const losingSuper = target.role === 'super_admin' && (nextRole !== 'super_admin' || nextActive === false);
    if (losingSuper) {
      const activeSupers = await prisma.user.count({ where: { role: 'super_admin', isActive: true } });
      if (activeSupers <= 1) {
        res.status(400).json({ error: 'There must be at least one active super admin.' });
        return;
      }
    }

    const updated = await prisma.user.update({
      where:  { id },
      data:   { role: nextRole, isActive: nextActive },
      select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true },
    });
    res.json({ data: updated });
  } catch (err) {
    console.error('PATCH /api/settings/admins/:id error:', err);
    res.status(500).json({ error: 'Failed to update administrator' });
  }
});

export default router;
