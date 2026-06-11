import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function fmtRand(n: number) {
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}

/* ── GET /api/dashboard ──────────────────────────────────────────────
   Admin dashboard panels: pending actions, distribution summary, and a
   recent activity feed — all derived from the database.
──────────────────────────────────────────────────────────────────────── */
router.get('/', requireAuth, requireRole('admin', 'super_admin'), async (_req, res: Response) => {
  try {
    const [invitationRequests, pendingKyc, pendingPledges, unsignedAgreements, missingBank, distributions, recentPledges, recentKyc] =
      await Promise.all([
        prisma.invitationRequest.findMany({
          where:   { status: 'pending' },
          select:  { id: true, email: true, fullName: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findMany({
          where:   { role: 'investor', kycStatus: 'pending' },
          select:  { id: true, fullName: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.pledge.findMany({
          where:   { status: 'pending' },
          include: { user: { select: { fullName: true } }, property: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.document.findMany({
          where:   { docType: 'investment_agreement', signingStatus: { in: ['pending', 'sent'] } },
          include: { user: { select: { fullName: true } }, property: { select: { title: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findMany({
          where: {
            role: 'investor',
            pledges: { some: { status: 'confirmed' } },
            OR: [{ investorProfile: { is: null } }, { investorProfile: { bankAccountNumber: null } }],
          },
          select: { id: true, fullName: true },
        }),
        prisma.distribution.findMany({
          include: { lines: { select: { netAmount: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.pledge.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { fullName: true } }, property: { select: { title: true } } },
        }),
        prisma.user.findMany({
          where:   { role: 'investor', kycStatus: 'approved', kycVerifiedAt: { not: null } },
          take: 5,
          orderBy: { kycVerifiedAt: 'desc' },
          select:  { fullName: true, kycVerifiedAt: true },
        }),
      ]);

    /* ── Pending actions ── */
    type Action = { name: string; sub: string; action: string; href: string; dot: 'orange' | 'green' | 'gray' };
    const pendingActions: Action[] = [];
    for (const r of invitationRequests) {
      pendingActions.push({
        name: `Invitation request — ${r.fullName ?? r.email}`,
        sub: `${r.email} · wants to join`,
        action: 'Invite',
        href: `/admin/investors/invite?email=${encodeURIComponent(r.email)}`,
        dot: 'orange',
      });
    }
    for (const u of pendingKyc) {
      pendingActions.push({ name: `Verify investor — ${u.fullName}`, sub: 'KYC submitted · awaiting approval', action: 'Verify', href: `/admin/investors/${u.id}`, dot: 'orange' });
    }
    for (const p of pendingPledges) {
      pendingActions.push({ name: `Confirm pledge — ${p.user.fullName}`, sub: `${fmtRand(Number(p.amount))} · ${p.property.title}`, action: 'Confirm', href: `/admin/properties/${p.property.id}`, dot: 'green' });
    }
    for (const d of unsignedAgreements) {
      pendingActions.push({ name: `Agreement unsigned — ${d.user.fullName}`, sub: d.property?.title ?? 'Investment agreement', action: 'Follow up', href: '/admin/agreements', dot: 'gray' });
    }
    for (const u of missingBank) {
      pendingActions.push({ name: `Missing bank details — ${u.fullName}`, sub: 'Cannot distribute until resolved', action: 'Chase', href: `/admin/investors/${u.id}`, dot: 'orange' });
    }

    /* ── Distribution summary (last 6 months) ── */
    const months: { key: string; label: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-ZA', { month: 'short' }), amount: 0 });
    }
    const monthIndex = new Map(months.map((m, i) => [m.key, i]));
    let totalNet = 0;
    for (const dist of distributions) {
      const net = dist.lines.reduce((s, l) => s + Number(l.netAmount), 0);
      totalNet += net;
      if (dist.processedAt) {
        const dd = new Date(dist.processedAt);
        const idx = monthIndex.get(`${dd.getFullYear()}-${dd.getMonth()}`);
        if (idx !== undefined) months[idx].amount += net;
      }
    }
    const lastCompleted = distributions.find((d) => d.status === 'completed');
    const lastRunNet = lastCompleted ? lastCompleted.lines.reduce((s, l) => s + Number(l.netAmount), 0) : 0;

    const distributionSummary = {
      months: months.map((m) => ({ label: m.label, amount: m.amount })),
      lastRunDate:   lastCompleted?.processedAt ?? null,
      lastRunAmount: lastRunNet,
      totalNet,
      runCount:      distributions.length,
    };

    /* ── Activity feed ── */
    type Feed = { text: string; date: string; dot: 'green' | 'blue' | 'gold' };
    const feed: Feed[] = [];
    for (const p of recentPledges) {
      feed.push({ text: `${p.user.fullName} pledged on ${p.property.title}`, date: p.createdAt.toISOString(), dot: 'green' });
    }
    for (const u of recentKyc) {
      if (u.kycVerifiedAt) feed.push({ text: `${u.fullName} passed KYC verification`, date: u.kycVerifiedAt.toISOString(), dot: 'blue' });
    }
    for (const d of distributions.slice(0, 4)) {
      if (d.processedAt) feed.push({ text: `Distribution processed — ${d.periodLabel}`, date: d.processedAt.toISOString(), dot: 'gold' });
    }
    feed.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    res.json({
      pendingActions: pendingActions.slice(0, 6),
      pendingTotal:   pendingActions.length,
      distributionSummary,
      activityFeed:   feed.slice(0, 6),
    });
  } catch (err) {
    console.error('GET /api/dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
