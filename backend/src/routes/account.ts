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

/* ── Investor profile (banking + personal details) ──────────────────
   Self-service for the signed-in user's InvestorProfile. ID number/type
   lock once KYC is approved (changing verified identity needs re-verification).
──────────────────────────────────────────────────────────────────────── */

const ID_TYPES = ['id_book', 'passport', 'drivers_license'];

async function loadProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    include: { investorProfile: true },
  });
  return user;
}

function profileDto(kycStatus: string, p: {
  idNumber: string | null; idType: string | null; taxNumber: string | null;
  bankName: string | null; bankAccountNumber: string | null; bankBranchCode: string | null;
  addressLine1: string | null; city: string | null; province: string | null; postalCode: string | null;
} | null) {
  return {
    kycStatus,
    idLocked: kycStatus === 'approved',
    idNumber: p?.idNumber ?? null,
    idType: p?.idType ?? null,
    taxNumber: p?.taxNumber ?? null,
    bankName: p?.bankName ?? null,
    bankAccountNumber: p?.bankAccountNumber ?? null,
    bankBranchCode: p?.bankBranchCode ?? null,
    addressLine1: p?.addressLine1 ?? null,
    city: p?.city ?? null,
    province: p?.province ?? null,
    postalCode: p?.postalCode ?? null,
  };
}

/* GET /api/account/investor-profile */
router.get('/investor-profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await loadProfile(req.user!.sub);
    if (!user) { res.status(404).json({ error: 'Account not found' }); return; }
    res.json({ data: profileDto(user.kycStatus, user.investorProfile) });
  } catch (err) {
    console.error('GET /api/account/investor-profile error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

const cleanStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/* PUT /api/account/banking — bank details used to receive distributions */
router.put('/banking', requireAuth, async (req: AuthRequest, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const fields: Record<string, string> = {};

  const bankName = cleanStr(b.bankName);
  const bankAccountNumber = cleanStr(b.bankAccountNumber);
  const bankBranchCode = cleanStr(b.bankBranchCode);

  if (bankAccountNumber && !/^\d{5,20}$/.test(bankAccountNumber)) fields.bankAccountNumber = 'Enter a valid account number (5–20 digits).';
  if (bankBranchCode && !/^\d{4,8}$/.test(bankBranchCode)) fields.bankBranchCode = 'Enter a valid branch code (4–8 digits).';

  if (Object.keys(fields).length > 0) { res.status(400).json({ error: 'Some details are invalid.', fields }); return; }

  try {
    const data = { bankName, bankAccountNumber, bankBranchCode };
    await prisma.investorProfile.upsert({
      where:  { userId: req.user!.sub },
      update: data,
      create: { userId: req.user!.sub, ...data },
    });
    const user = await loadProfile(req.user!.sub);
    res.json({ data: profileDto(user!.kycStatus, user!.investorProfile) });
  } catch (err) {
    console.error('PUT /api/account/banking error:', err);
    res.status(500).json({ error: 'Failed to save banking details' });
  }
});

/* PUT /api/account/personal — address, tax, and (pre-KYC) ID details */
router.put('/personal', requireAuth, async (req: AuthRequest, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const fields: Record<string, string> = {};

  const addressLine1 = cleanStr(b.addressLine1);
  const city = cleanStr(b.city);
  const province = cleanStr(b.province);
  const postalCode = cleanStr(b.postalCode);
  const taxNumber = cleanStr(b.taxNumber);

  if (postalCode && !/^\d{4}$/.test(postalCode)) fields.postalCode = 'Enter a valid 4-digit postal code.';

  const idType = cleanStr(b.idType);
  if (idType && !ID_TYPES.includes(idType)) fields.idType = 'Choose a valid ID type.';
  const idNumber = cleanStr(b.idNumber);

  if (Object.keys(fields).length > 0) { res.status(400).json({ error: 'Some details are invalid.', fields }); return; }

  try {
    const user = await loadProfile(req.user!.sub);
    if (!user) { res.status(404).json({ error: 'Account not found' }); return; }
    const idLocked = user.kycStatus === 'approved';

    const data: Record<string, unknown> = { addressLine1, city, province, postalCode, taxNumber };
    // Only allow ID changes before KYC approval.
    if (!idLocked) {
      data.idNumber = idNumber;
      data.idType = idType;
    }

    await prisma.investorProfile.upsert({
      where:  { userId: req.user!.sub },
      update: data,
      create: { userId: req.user!.sub, ...data },
    });
    const updated = await loadProfile(req.user!.sub);
    res.json({ data: profileDto(updated!.kycStatus, updated!.investorProfile) });
  } catch (err) {
    console.error('PUT /api/account/personal error:', err);
    res.status(500).json({ error: 'Failed to save personal details' });
  }
});

export default router;
