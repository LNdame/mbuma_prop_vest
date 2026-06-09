import s from './page.module.css';
import { apiFetch } from '@/lib/api';

/* ── Types ─────────────────────────────────────────────────────── */
interface Property {
  id: string;
  title: string;
  propertyType: string;
  status: string;
  targetRaise: string;
  fundedAmount: string;
  netMonthlyRent: string;
  projectedYieldPct: string;
}

interface Investor {
  id: string;
  fullName: string;
  kycStatus: string;
  isActive: boolean;
  totalInvested: number;
  propertyCount: number;
}

interface DashboardData {
  pendingActions: { name: string; sub: string; action: string; href: string; dot: string }[];
  pendingTotal: number;
  distributionSummary: {
    months: { label: string; amount: number }[];
    lastRunDate: string | null;
    lastRunAmount: number;
    totalNet: number;
    runCount: number;
  };
  activityFeed: { text: string; date: string; dot: string }[];
}

const EMPTY_DASH: DashboardData = {
  pendingActions: [],
  pendingTotal: 0,
  distributionSummary: { months: [], lastRunDate: null, lastRunAmount: 0, totalNet: 0, runCount: 0 },
  activityFeed: [],
};

/* ── Stat helpers ────────────────────────────────────────────────── */
function fmtRandShort(n: number) {
  if (n >= 1_000_000) return 'R' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return 'R' + n.toLocaleString('en-ZA');
  return 'R' + n;
}

function buildStats(properties: Property[], investors: Investor[]) {
  const totalRaised = properties.reduce((s, p) => s + Number(p.fundedAmount), 0);

  const activeCount  = investors.filter(i => i.isActive).length;
  const pendingCount = investors.filter(i => i.kycStatus === 'pending').length;

  const liveProps   = properties.filter(p => p.status === 'open' || p.status === 'funded');
  const monthlyDist = liveProps.reduce((s, p) => s + Number(p.netMonthlyRent), 0);

  const yieldAvg = liveProps.length
    ? liveProps.reduce((s, p) => s + Number(p.projectedYieldPct), 0) / liveProps.length
    : 0;

  return [
    {
      label: 'Total raised',
      value: totalRaised ? fmtRandShort(totalRaised) : 'R0',
      sub:   `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`,
      accent: false,
    },
    {
      label: 'Active investors',
      value: String(activeCount),
      sub:   `${pendingCount} pending KYC`,
      accent: false,
    },
    {
      label: 'Monthly net income',
      value: monthlyDist ? fmtRandShort(monthlyDist) : 'R0',
      sub:   `${liveProps.length} active ${liveProps.length === 1 ? 'property' : 'properties'}`,
      accent: true,
    },
    {
      label: 'Portfolio yield',
      value: yieldAvg ? yieldAvg.toFixed(1) + '%' : '—',
      sub:   'avg. gross',
      accent: false,
    },
  ];
}

const QUICK_ACTIONS = [
  { icon: '👤', label: 'Invite investor',  color: 'purple', href: '/admin/investors/invite' },
  { icon: '💸', label: 'Run distribution', color: 'green',  href: '/admin/distributions'    },
  { icon: '📄', label: 'Agreements',       color: 'gold',   href: '/admin/agreements'       },
  { icon: '📊', label: 'Reports',          color: 'blue',   href: '/admin/reports'          },
];

function buildGlance(properties: Property[], investors: Investor[]) {
  const totalInvested = investors.reduce((s, i) => s + i.totalInvested, 0);
  return [
    { label: 'Total properties',      value: String(properties.length),                                       accent: false },
    { label: 'Open raises',           value: String(properties.filter(p => p.status === 'open').length),      accent: false },
    { label: 'Fully funded',          value: String(properties.filter(p => p.status === 'funded').length),    accent: false },
    { label: 'Total investors',       value: String(investors.length),                                         accent: false },
    { label: 'Total invested',        value: totalInvested ? fmtRandShort(totalInvested) : 'R0',              accent: true  },
  ];
}

/* ── Helpers ────────────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtRandShortMeta(n: number) {
  if (!n) return 'R0';
  if (n >= 1_000_000) return 'R' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function propertyIcon(type: string) {
  if (type === 'commercial') return '🏢';
  if (type === 'mixed_use')  return '🏗';
  return '🏘';
}

function pct(funded: string, target: string) {
  const t = Number(target);
  if (!t) return 0;
  return Math.round((Number(funded) / t) * 100);
}

function fmtRand(n: number) {
  if (!n) return '—';
  return 'R' + n.toLocaleString('en-ZA');
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function statusClass(status: string, styles: Record<string, string>) {
  if (status === 'open')    return styles.pillOpen;
  if (status === 'funded')  return styles.pillFunded;
  if (status === 'approved') return styles.pillActive;
  if (status === 'pending') return styles.pillPending;
  if (status === 'Confirm') return styles.pillConfirm;
  return styles.pillDraft;
}

const AVATAR_COLORS = ['av0', 'av1', 'av2', 'av3', 'av4'];

/* ── Page (Server Component) ────────────────────────────────────── */
export default async function AdminDashboard() {
  let properties: Property[] = [];
  let investors:  Investor[]  = [];
  let dash: DashboardData = EMPTY_DASH;

  try {
    const [propsRes, invRes, dashRes] = await Promise.all([
      apiFetch<{ data: Property[] }>('/api/properties'),
      apiFetch<{ data: Investor[]  }>('/api/investors'),
      apiFetch<DashboardData>('/api/dashboard'),
    ]);
    properties = propsRes.data;
    investors  = invRes.data;
    dash       = dashRes;
  } catch (err) {
    console.error('[dashboard] apiFetch failed:', err);
  }

  const maxDistMonth = Math.max(1, ...dash.distributionSummary.months.map((m) => m.amount));

  const stats  = buildStats(properties, investors);
  const glance = buildGlance(properties, investors);

  return (
    <div className={s.page}>

      {/* Page header */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Dashboard</h1>
          <p className={s.pageSub}>Overview of your portfolio and pending actions</p>
        </div>
        <a href="/admin/properties/new"><button className={s.btnPrimary}>＋ New property</button></a>
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        {stats.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={[s.statValue, st.accent ? s.accent : ''].filter(Boolean).join(' ')}>
              {st.value}
            </div>
            <div className={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className={s.quickActions}>
        {QUICK_ACTIONS.map((qa) => (
          <a key={qa.label} href={qa.href} className={s.qaBtn}>
            <span className={[s.qaIcon, s[`qaIcon_${qa.color}`]].join(' ')}>{qa.icon}</span>
            <span>{qa.label}</span>
          </a>
        ))}
      </div>

      {/* Main grid */}
      <div className={s.mainGrid}>
        <div className={s.leftCol}>

          {/* Pending actions */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Pending actions</span>
              <span className={s.badgeCount}>{dash.pendingTotal}</span>
            </div>
            {dash.pendingActions.length === 0 ? (
              <div className={s.emptyState}>All caught up — no pending actions 🎉</div>
            ) : dash.pendingActions.map((p) => (
              <div key={p.name} className={s.pendingRow}>
                <div className={s.pendingInfo}>
                  <span className={[s.dot, s[`dot_${p.dot}`]].join(' ')} />
                  <div>
                    <div className={s.pendingName}>{p.name}</div>
                    <div className={s.pendingSub}>{p.sub}</div>
                  </div>
                </div>
                <a href={p.href}><button className={s.btnSm}>{p.action}</button></a>
              </div>
            ))}
          </div>

          {/* Properties — LIVE from DB */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Properties</span>
              <a href="/admin/properties" className={s.panelLink}>View all →</a>
            </div>
            {properties.slice(0, 4).length === 0 ? (
              <div className={s.emptyState}>No properties found — run the seed script</div>
            ) : properties.slice(0, 4).map((p) => {
              const fundedPct = pct(p.fundedAmount, p.targetRaise);
              const statusLabel = p.status.charAt(0).toUpperCase() + p.status.slice(1);
              return (
                <div key={p.id} className={s.propRow}>
                  <div className={s.propLeft}>
                    <span className={s.propIcon}>{propertyIcon(p.propertyType)}</span>
                    <div>
                      <div className={s.propName}>{p.title}</div>
                      <div className={s.propSub}>
                        {p.propertyType.replace('_', ' ')} · {Number(p.projectedYieldPct).toFixed(1)}% yield
                      </div>
                    </div>
                  </div>
                  <div className={s.propRight}>
                    {p.status !== 'draft' && (
                      <>
                        <div className={s.progTrack}>
                          <div className={s.progFill} style={{ width: `${fundedPct}%` }} />
                        </div>
                        <span className={s.propPct}>{fundedPct}%</span>
                      </>
                    )}
                    <span className={statusClass(p.status, s)}>{statusLabel}</span>
                    <a href={`/admin/properties/${p.id}`}>
                      <button className={s.btnSm}>{p.status === 'draft' ? 'Edit' : 'View'}</button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        <div className={s.rightCol}>

          {/* Distribution summary */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Distribution summary</span>
            </div>
            <div className={s.chartWrap}>
              {dash.distributionSummary.months.map((m, i) => (
                <div
                  key={i}
                  className={s.bar}
                  style={{ height: m.amount ? `${Math.max(6, Math.round((m.amount / maxDistMonth) * 100))}%` : '4px', opacity: m.amount ? 1 : 0.25 }}
                  title={`${m.label}: ${fmtRandShortMeta(m.amount)}`}
                />
              ))}
            </div>
            <div className={s.chartLabels}>
              {dash.distributionSummary.months.map((m, i) => <span key={i}>{m.label}</span>)}
            </div>
            <div className={s.distMeta}>
              <div className={s.distRow}><span className={s.distLabel}>Last run</span><span className={s.distVal}>{fmtDate(dash.distributionSummary.lastRunDate)}</span></div>
              <div className={s.distRow}><span className={s.distLabel}>Amount sent</span><span className={[s.distVal, s.accent].join(' ')}>{fmtRandShortMeta(dash.distributionSummary.lastRunAmount)}</span></div>
              <div className={s.distRow}><span className={s.distLabel}>Total distributed</span><span className={s.distVal}>{fmtRandShortMeta(dash.distributionSummary.totalNet)}</span></div>
            </div>
            <div className={s.panelFooter}>
              <a href="/admin/distributions"><button className={s.btnBlock}>Run distribution →</button></a>
            </div>
          </div>

          {/* Portfolio at a glance */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Portfolio at a glance</span>
            </div>
            {glance.map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, g.accent ? s.accent : ''].filter(Boolean).join(' ')}>
                  {g.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom grid */}
      <div className={s.botGrid}>

        {/* Investors — LIVE from DB */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Investors</span>
            <a href="/admin/investors" className={s.panelLink}>View all →</a>
          </div>
          {investors.length === 0 ? (
            <div className={s.emptyState}>No investors found — run the seed script</div>
          ) : investors.slice(0, 5).map((inv, i) => (
            <div key={inv.id} className={s.invRow}>
              <div className={s.invLeft}>
                <div className={[s.invAvatar, s[AVATAR_COLORS[i % AVATAR_COLORS.length]]].join(' ')}>
                  {initials(inv.fullName)}
                </div>
                <div>
                  <div className={s.invName}>{inv.fullName}</div>
                  <div className={s.invSub}>
                    {inv.propertyCount} {inv.propertyCount === 1 ? 'property' : 'properties'} · {fmtRand(inv.totalInvested)} invested
                  </div>
                </div>
              </div>
              <div className={s.invRight}>
                <span className={statusClass(inv.kycStatus, s)}>
                  {inv.kycStatus === 'approved' ? 'Active' : 'Pending'}
                </span>
                <a href={`/admin/investors/${inv.id}`}>
                  <button className={s.btnSm}>View</button>
                </a>
              </div>
            </div>
          ))}
          <div className={s.panelFooter}>
            <a href="/admin/investors/invite">
              <button className={s.btnOutline}>＋ Invite new investor</button>
            </a>
          </div>
        </div>

        {/* Activity feed */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Activity feed</span>
          </div>
          {dash.activityFeed.length === 0 ? (
            <div className={s.emptyState}>No recent activity</div>
          ) : dash.activityFeed.map((f, i) => (
            <div key={i} className={s.feedItem}>
              <span className={[s.feedDot, s[`dot_${f.dot}`]].join(' ')} />
              <div>
                <div className={s.feedText}>{f.text}</div>
                <div className={s.feedTime}>{timeAgo(f.date)}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
