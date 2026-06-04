import s from '../investor.module.css';

const PLEDGES = [
  {
    icon: '🏘', property: '14 Fern Close, Fourways',
    type: 'Residential · Sandton, Gauteng',
    pledged: 'R150,000', currentValue: 'R163,500', yield: '9.2%',
    status: 'Confirmed', funded: 72,
    pledgeDate: '12 Jan 2025', distributions: 'R5,520 received',
  },
  {
    icon: '🏢', property: 'Shop 4, Kyalami Corner',
    type: 'Commercial · Kyalami, Gauteng',
    pledged: 'R100,000', currentValue: 'R108,000', yield: '10.8%',
    status: 'Confirmed', funded: 38,
    pledgeDate: '28 May 2025', distributions: 'R0 received',
  },
  {
    icon: '🏘', property: 'Unit 7, Sandton Gardens',
    type: 'Residential · Sandton, Gauteng',
    pledged: 'R100,000', currentValue: 'R110,000', yield: '8.7%',
    status: 'Confirmed', funded: 100,
    pledgeDate: '3 Mar 2024', distributions: 'R8,700 received',
  },
];

const SUMMARY = [
  { label: 'Total pledged',            value: 'R350,000' },
  { label: 'Estimated current value',  value: 'R381,500', accent: true },
  { label: 'Total distributions recv', value: 'R14,220',  accent: true },
  { label: 'Unrealised gain',          value: '+R31,500'  },
  { label: 'Active pledges',           value: '3'         },
  { label: 'Avg. yield',               value: '9.4%'      },
];

function statusPill(status: string, s: Record<string,string>) {
  if (status === 'Confirmed') return s.pillConfirmed;
  if (status === 'Pending')   return s.pillPending;
  return s.pillClosed;
}

export default function InvestorPortfolio() {
  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>My Portfolio</h1>
          <p className={s.pageSub}>Your confirmed pledges and investment performance</p>
        </div>
        <a href="/investor/properties">
          <button className={s.btnPrimary}>＋ New investment</button>
        </a>
      </div>

      {/* Summary stats */}
      <div className={s.statsRow}>
        {[
          { label: 'Total invested',  value: 'R350,000', sub: '3 properties',     accent: false },
          { label: 'Current value',   value: 'R381,500', sub: '+R31,500 growth',  accent: false },
          { label: 'Total received',  value: 'R14,220',  sub: 'all distributions',accent: true  },
          { label: 'Avg. yield',      value: '9.4%',     sub: 'gross p.a.',       accent: false },
        ].map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={[s.statValue, st.accent ? s.accent : ''].filter(Boolean).join(' ')}>
              {st.value}
            </div>
            <div className={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.mainGrid}>

        {/* Pledges list */}
        <div className={s.leftCol}>
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>My Pledges</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>3 active</span>
            </div>

            {PLEDGES.map((p) => (
              <div key={p.property} style={{ padding: '16px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span className={s.rowIcon}>{p.icon}</span>
                    <div>
                      <div className={s.rowName}>{p.property}</div>
                      <div className={s.rowSub}>{p.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className={statusPill(p.status, s as Record<string,string>)}>{p.status}</span>
                    <button className={s.btnSm}>View</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Pledged</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-900)' }}>{p.pledged}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Est. value</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-600)' }}>{p.currentValue}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Yield</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-900)' }}>{p.yield}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Distributions</div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--neutral-700)' }}>{p.distributions}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-500)', marginBottom: 4 }}>
                    <span>Property funding progress</span>
                    <span>{p.funded}%</span>
                  </div>
                  <div className={s.fundingBarTrack}>
                    <div className={s.fundingBarFill} style={{ width: `${p.funded}%` }} />
                  </div>
                </div>
              </div>
            ))}

            <div className={s.panelFooter}>
              <a href="/investor/properties">
                <button className={s.btnOutline}>＋ Invest in another property</button>
              </a>
            </div>
          </div>
        </div>

        {/* Right — summary */}
        <div className={s.rightCol}>
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Portfolio Summary</span>
            </div>
            {SUMMARY.map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>
                  {g.value}
                </span>
              </div>
            ))}
          </div>

          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Allocation by Type</span>
            </div>
            {[
              { type: 'Residential', amount: 'R250,000', pct: 71 },
              { type: 'Commercial',  amount: 'R100,000', pct: 29 },
            ].map((a) => (
              <div key={a.type} style={{ padding: '12px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, color: 'var(--neutral-800)' }}>{a.type}</span>
                  <span style={{ color: 'var(--neutral-500)' }}>{a.amount} · {a.pct}%</span>
                </div>
                <div className={s.fundingBarTrack} style={{ height: 7 }}>
                  <div className={s.fundingBarFill} style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
