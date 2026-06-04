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
  { icon: '📢', label: 'Send update',      color: 'gold',   href: '#'                       },
  { icon: '📤', label: 'Export report',    color: 'blue',   href: '#'                       },
];

const PENDING = [
  { name: 'Verify investor — R. Dlamini',      sub: 'Submitted ID · waiting approval',   action: 'Verify',    dot: 'orange' },
  { name: 'Confirm pledge — P. Sithole',       sub: 'R75,000 · Shop 4, Kyalami',         action: 'Confirm',   dot: 'green'  },
  { name: 'Agreement unsigned — N. Mokoena',  sub: 'Fern Close · sent 3 days ago',      action: 'Follow up', dot: 'gray'   },
  { name: 'Missing bank details — N. Mokoena',sub: 'Cannot distribute until resolved',   action: 'Chase',     dot: 'orange' },
];

const DIST_BARS   = [35, 45, 55, 72, 90, 100];
const DIST_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

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

const FEED = [
  { dot: 'green', text: 'Andile Molefe pledged on Kyalami Corner', time: 'Today'       },
  { dot: 'green', text: 'Precious Nkosi pledged on Fern Close',    time: 'Today'       },
  { dot: 'green', text: 'Sipho Khumalo pledged on Sandton Gardens', time: 'Today'      },
  { dot: 'blue',  text: 'Database seeded with 3 properties',        time: 'Today'      },
];

/* ── Helpers ────────────────────────────────────────────────────── */
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

  try {
    const [propsRes, invRes] = await Promise.all([
      apiFetch<{ data: Property[] }>('/api/properties'),
      apiFetch<{ data: Investor[]  }>('/api/investors'),
    ]);
    properties = propsRes.data;
    investors  = invRes.data;
  } catch (err) {
    console.error('[dashboard] apiFetch failed:', err);
  }

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
              <span className={s.badgeCount}>{PENDING.length}</span>
            </div>
            {PENDING.map((p) => (
              <div key={p.name} className={s.pendingRow}>
                <div className={s.pendingInfo}>
                  <span className={[s.dot, s[`dot_${p.dot}`]].join(' ')} />
                  <div>
                    <div className={s.pendingName}>{p.name}</div>
                    <div className={s.pendingSub}>{p.sub}</div>
                  </div>
                </div>
                <button className={s.btnSm}>{p.action}</button>
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
              {DIST_BARS.map((h, i) => (
                <div key={i} className={s.bar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={s.chartLabels}>
              {DIST_LABELS.map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className={s.distMeta}>
              <div className={s.distRow}><span className={s.distLabel}>Last run</span><span className={s.distVal}>1 Jun 2025</span></div>
              <div className={s.distRow}><span className={s.distLabel}>Amount sent</span><span className={[s.distVal, s.accent].join(' ')}>R47,200</span></div>
              <div className={s.distRow}><span className={s.distLabel}>Next run</span><span className={s.distVal}>1 Jul 2025</span></div>
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
          {FEED.map((f, i) => (
            <div key={i} className={s.feedItem}>
              <span className={[s.feedDot, s[`dot_${f.dot}`]].join(' ')} />
              <div>
                <div className={s.feedText}>{f.text}</div>
                <div className={s.feedTime}>{f.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
