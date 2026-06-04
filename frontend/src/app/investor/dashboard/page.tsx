import s from '../investor.module.css';

const STATS = [
  { label: 'Total invested',        value: 'R350,000', sub: '3 properties',      accent: false },
  { label: 'Portfolio value',        value: 'R381,500', sub: '+R31,500 growth',   accent: false },
  { label: 'Next distribution',      value: 'R2,912',   sub: 'due 1 Jul 2025',    accent: true  },
  { label: 'Avg. projected yield',   value: '9.4%',     sub: 'gross p.a.',        accent: false },
];

const HOLDINGS = [
  { icon: '🏘', name: '14 Fern Close, Fourways',   sub: 'Residential · R150,000 invested', pct: 72,  yield: '9.2%', status: 'Open'   },
  { icon: '🏢', name: 'Shop 4, Kyalami Corner',    sub: 'Commercial · R100,000 invested',  pct: 38,  yield: '10.8%',status: 'Open'   },
  { icon: '🏘', name: 'Unit 7, Sandton Gardens',   sub: 'Residential · R100,000 invested', pct: 100, yield: '8.7%', status: 'Funded' },
];

const DIST_BARS   = [22, 28, 32, 40, 52, 62];
const DIST_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const GLANCE = [
  { label: 'Properties held',     value: '3'         },
  { label: 'Confirmed pledges',   value: '3'         },
  { label: 'Pending pledges',     value: '0'         },
  { label: 'Total distributions', value: 'R14,320'   },
  { label: 'YTD distributions',   value: 'R8,736',   accent: true },
  { label: 'Unsigned docs',       value: '0'         },
];

const FEED = [
  { dot: 'green', text: 'R2,912 distribution scheduled for 1 Jul',  time: '2 hours ago'  },
  { dot: 'green', text: 'Pledge confirmed — Kyalami Corner',         time: '3 Jun 2025'   },
  { dot: 'blue',  text: 'R2,412 paid — Fern Close distribution',     time: '1 Jun 2025'   },
  { dot: 'blue',  text: 'R1,500 paid — Sandton Gardens distribution', time: '1 Jun 2025'   },
  { dot: 'gold',  text: 'Investment agreement signed — Kyalami',      time: '28 May 2025'  },
];

function statusPill(status: string, s: Record<string,string>) {
  if (status === 'Open')   return s.pillOpen;
  if (status === 'Funded') return s.pillFunded;
  return s.pillClosed;
}

export default function InvestorDashboard() {
  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Good morning, Sipho 👋</h1>
          <p className={s.pageSub}>Here&apos;s an overview of your investment portfolio</p>
        </div>
        <a href="/investor/properties">
          <button className={s.btnPrimary}>＋ Invest in a property</button>
        </a>
      </div>

      {/* Stats */}
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

      {/* Main grid */}
      <div className={s.mainGrid}>

        {/* Left */}
        <div className={s.leftCol}>

          {/* My holdings */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>My Holdings</span>
              <a href="/investor/portfolio" className={s.panelLink}>View all →</a>
            </div>
            {HOLDINGS.map((h) => (
              <div key={h.name} className={s.row}>
                <div className={s.rowLeft}>
                  <span className={s.rowIcon}>{h.icon}</span>
                  <div>
                    <div className={s.rowName}>{h.name}</div>
                    <div className={s.rowSub}>{h.sub}</div>
                  </div>
                </div>
                <div className={s.rowRight}>
                  <div className={s.progTrack}>
                    <div className={s.progFill} style={{ width: `${h.pct}%` }} />
                  </div>
                  <span className={s.propPct}>{h.pct}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-600)', minWidth: 36 }}>{h.yield}</span>
                  <span className={statusPill(h.status, s as Record<string,string>)}>{h.status}</span>
                  <button className={s.btnSm}>View</button>
                </div>
              </div>
            ))}
            <div className={s.panelFooter}>
              <a href="/investor/properties">
                <button className={s.btnOutline}>＋ Add investment</button>
              </a>
            </div>
          </div>

          {/* Activity feed */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Recent Activity</span>
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

        {/* Right */}
        <div className={s.rightCol}>

          {/* Distribution chart */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>My Distributions</span>
              <a href="/investor/distributions" className={s.panelLink}>View all →</a>
            </div>
            <div className={s.chartWrap}>
              {DIST_BARS.map((h, i) => (
                <div key={i} className={s.bar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={s.chartLabels}>
              {DIST_LABELS.map((l) => <span key={l}>{l}</span>)}
            </div>
            <div className={s.metaBlock}>
              <div className={s.metaRow}><span className={s.metaLabel}>Last paid</span><span className={s.metaVal}>1 Jun 2025</span></div>
              <div className={s.metaRow}><span className={s.metaLabel}>Amount received</span><span className={[s.metaVal, s.accent].join(' ')}>R3,912</span></div>
              <div className={s.metaRow}><span className={s.metaLabel}>Next payment</span><span className={s.metaVal}>1 Jul 2025</span></div>
              <div className={s.metaRow}><span className={s.metaLabel}>Estimated amount</span><span className={[s.metaVal, s.accent].join(' ')}>R2,912</span></div>
            </div>
          </div>

          {/* Portfolio at a glance */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Portfolio at a Glance</span>
            </div>
            {GLANCE.map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>
                  {g.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
