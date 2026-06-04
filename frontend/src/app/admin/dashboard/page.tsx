import s from './page.module.css';

/* ── Mock data ─────────────────────────────────────────────── */
const STATS = [
  { label: 'Total raised',          value: 'R6.7M',   sub: '4 properties',  accent: false },
  { label: 'Active investors',       value: '14',      sub: '3 pending',     accent: false },
  { label: 'Monthly distributions', value: 'R47,200', sub: 'next: 1 Jul',   accent: true  },
  { label: 'Portfolio yield',        value: '9.4%',    sub: 'avg. gross',    accent: false },
];

const QUICK_ACTIONS = [
  { icon: '👤', label: 'Invite investor',  color: 'purple' },
  { icon: '💸', label: 'Run distribution', color: 'green'  },
  { icon: '📢', label: 'Send update',      color: 'gold'   },
  { icon: '📤', label: 'Export report',    color: 'blue'   },
];

const PENDING = [
  { name: 'Verify investor — R. Dlamini',   sub: 'Submitted ID · waiting approval',   action: 'Verify',    dot: 'orange' },
  { name: 'Confirm pledge — P. Sithole',    sub: 'R75,000 · Shop 4, Kyalami',         action: 'Confirm',   dot: 'green'  },
  { name: 'Agreement unsigned — N. Mokoena',sub: 'Fern Close · sent 3 days ago',      action: 'Follow up', dot: 'gray'   },
  { name: 'Missing bank details — N. Mokoena', sub: 'Cannot distribute until resolved', action: 'Chase',   dot: 'orange' },
];

const PROPERTIES = [
  { icon: '🏘', name: '14 Fern Close, Fourways',  sub: 'Residential · 6 investors',         pct: 72,  status: 'Open',   cta: 'Edit'  },
  { icon: '🏢', name: 'Shop 4, Kyalami Corner',   sub: 'Commercial · 4 investors',           pct: 38,  status: 'Open',   cta: 'Edit'  },
  { icon: '🏘', name: 'Unit 7, Sandton Gardens',  sub: 'Residential · 8 investors · tenanted', pct: 100, status: 'Funded', cta: 'View' },
  { icon: '📋', name: 'New listing — Bryanston',  sub: 'Not yet published',                  pct: 0,   status: 'Draft',  cta: 'Edit'  },
];

const DIST_BARS = [35, 45, 55, 72, 90, 100];
const DIST_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const GLANCE = [
  { label: 'Total properties',    value: '4',        accent: false },
  { label: 'Open raises',         value: '2',        accent: false },
  { label: 'Fully funded',        value: '1',        accent: false },
  { label: 'Drafts',              value: '1',        accent: false },
  { label: 'Total investors',     value: '14',       accent: false },
  { label: 'Total distributed YTD', value: 'R236,000', accent: true },
];

const INVESTORS = [
  { initials: 'SK', name: 'S. Khumalo',  sub: '2 properties · R350,000 invested', status: 'Active',  cta: 'View'   },
  { initials: 'PN', name: 'P. Nkosi',    sub: '1 property · R150,000 invested',   status: 'Active',  cta: 'View'   },
  { initials: 'AM', name: 'A. Molefe',   sub: '2 properties · R300,000 invested', status: 'Active',  cta: 'View'   },
  { initials: 'RD', name: 'R. Dlamini',  sub: 'ID submitted · not yet verified',  status: 'Pending', cta: 'Verify' },
  { initials: 'PS', name: 'P. Sithole',  sub: 'Pledge submitted · funds pending', status: 'Confirm', cta: 'Confirm'},
];

const FEED = [
  { dot: 'green',  text: 'P. Nkosi pledged R150k on Fern Close',    time: '2 hours ago'   },
  { dot: 'gold',   text: 'R. Dlamini completed registration',        time: 'Yesterday'     },
  { dot: 'blue',   text: 'R47,200 distribution sent · 8 investors',  time: '1 Jun 2025'    },
  { dot: 'green',  text: 'Kyalami Corner published',                  time: '28 May 2025'   },
];

/* ── Helpers ───────────────────────────────────────────────── */
function statusClass(status: string, styles: Record<string, string>) {
  if (status === 'Open')    return styles.pillOpen;
  if (status === 'Funded')  return styles.pillFunded;
  if (status === 'Active')  return styles.pillActive;
  if (status === 'Pending') return styles.pillPending;
  if (status === 'Confirm') return styles.pillConfirm;
  return styles.pillDraft;
}

/* ── Page ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  return (
    <div className={s.page}>

      {/* Page header */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Dashboard</h1>
          <p className={s.pageSub}>Overview of your portfolio and pending actions</p>
        </div>
        <button className={s.btnPrimary}>＋ New property</button>
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        {STATS.map((st) => (
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
          <button key={qa.label} className={s.qaBtn}>
            <span className={[s.qaIcon, s[`qaIcon_${qa.color}`]].join(' ')}>{qa.icon}</span>
            <span>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className={s.mainGrid}>
        {/* Left column */}
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

          {/* Properties */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Properties</span>
              <a href="/admin/properties" className={s.panelLink}>View all →</a>
            </div>
            {PROPERTIES.map((p) => (
              <div key={p.name} className={s.propRow}>
                <div className={s.propLeft}>
                  <span className={s.propIcon}>{p.icon}</span>
                  <div>
                    <div className={s.propName}>{p.name}</div>
                    <div className={s.propSub}>{p.sub}</div>
                  </div>
                </div>
                <div className={s.propRight}>
                  {p.status !== 'Draft' && (
                    <>
                      <div className={s.progTrack}>
                        <div className={s.progFill} style={{ width: `${p.pct}%` }} />
                      </div>
                      <span className={s.propPct}>{p.pct}%</span>
                    </>
                  )}
                  <span className={statusClass(p.status, s)}>{p.status}</span>
                  <button className={s.btnSm}>{p.cta}</button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right column */}
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
              <button className={s.btnBlock}>Run distribution →</button>
            </div>
          </div>

          {/* Portfolio at a glance */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Portfolio at a glance</span>
            </div>
            {GLANCE.map((g) => (
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

        {/* Investors */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Investors</span>
            <a href="/admin/investors" className={s.panelLink}>View all →</a>
          </div>
          {INVESTORS.map((inv, i) => (
            <div key={inv.name} className={s.invRow}>
              <div className={s.invLeft}>
                <div className={[s.invAvatar, s[`av${i}`]].join(' ')}>{inv.initials}</div>
                <div>
                  <div className={s.invName}>{inv.name}</div>
                  <div className={s.invSub}>{inv.sub}</div>
                </div>
              </div>
              <div className={s.invRight}>
                <span className={statusClass(inv.status, s)}>{inv.status}</span>
                <button className={s.btnSm}>{inv.cta}</button>
              </div>
            </div>
          ))}
          <div className={s.panelFooter}>
            <button className={s.btnOutline}>＋ Invite new investor</button>
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
