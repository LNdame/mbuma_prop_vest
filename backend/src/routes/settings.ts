import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { invalidateSettings } from '../lib/settings.js';

const router = Router();

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

  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: 'Some settings are invalid.', fields });
    return;
  }

  try {
    const data = {
      withholdingTaxRate: taxPct / 100,
      invitationExpiryDays: expiry,
      sessionHours: session,
      defaultMinPledge: minPledge,
      supportEmail,
      updatedBy: req.user!.sub,
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

export default router;
