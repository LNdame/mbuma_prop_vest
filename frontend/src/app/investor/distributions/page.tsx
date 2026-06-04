import s from '../investor.module.css';

const DIST_BARS   = [18, 22, 28, 32, 40, 52, 58, 62, 68, 72, 78, 0];
const DIST_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

const DISTRIBUTIONS = [
  { period: 'June 2025',  property: '14 Fern Close',       gross: 'R1,380', tax: 'R207', net: 'R1,173', status: 'Paid',    date: '1 Jun 2025' },
  { period: 'June 2025',  property: 'Unit 7, Sandton Gdns', gross: 'R870',  tax: 'R131', net: 'R739',   status: 'Paid',    date: '1 Jun 2025' },
  { period: 'June 2025',  property: 'Kyalami Corner',       gross: 'R0',    tax: 'R0',   net: 'R0',     status: 'Pending', date: 'Not yet distributed' },
  { period: 'May 2025',   property: '14 Fern Close',       gross: 'R1,380', tax: 'R207', net: 'R1,173', status: 'Paid',    date: '1 May 2025' },
  { period: 'May 2025',   property: 'Unit 7, Sandton Gdns', gross: 'R870',  tax: 'R131', net: 'R739',   status: 'Paid',    date: '1 May 2025' },
  { period: 'April 2025', property: '14 Fern Close',       gross: 'R1,380', tax: 'R207', net: 'R1,173', status: 'Paid',    date: '1 Apr 2025' },
  { period: 'April 2025', property: 'Unit 7, Sandton Gdns', gross: 'R870',  tax: 'R131', net: 'R739',   status: 'Paid',    date: '1 Apr 2025' },
];

const TOTALS = [
  { label: 'Total gross distributions', value: 'R16,820' },
  { label: 'Total withholding tax',      value: 'R2,524'  },
  { label: 'Total net received',         value: 'R14,296', accent: true },
  { label: 'YTD net (2025)',             value: 'R8,736',  accent: true },
  { label: 'Last payment date',          value: '1 Jun 2025' },
  { label: 'Next payment date',          value: '1 Jul 2025' },
];

function statusPill(status: string, s: Record<string,string>) {
  if (status === 'Paid')    return s.pillPaid;
  if (status === 'Pending') return s.pillPending;
  return s.pillClosed;
}

export default function InvestorDistributions() {
  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Distributions</h1>
          <p className={s.pageSub}>Your rental income history and upcoming payments</p>
        </div>
        <button className={s.btnPrimary}>⬇ Download statement</button>
      </div>

      {/* Stats */}
      <div className={s.statsRow}>
        {[
          { label: 'Total received',   value: 'R14,296', sub: 'net of withholding tax', accent: true  },
          { label: 'YTD 2025',         value: 'R8,736',  sub: 'Jan – Jun 2025',         accent: true  },
          { label: 'Next payment',     value: 'R2,912',  sub: 'estimated 1 Jul 2025',   accent: false },
          { label: 'Tax withheld YTD', value: 'R1,310',  sub: '15% withholding tax',    accent: false },
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
        <div className={s.leftCol}>

          {/* Distribution history table */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Distribution History</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{DISTRIBUTIONS.length} records</span>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr',
              padding: '8px 18px',
              background: 'var(--neutral-50)',
              borderBottom: '1px solid var(--neutral-100)',
              gap: 8,
            }}>
              {['Period','Property','Gross','Tax','Net','Date','Status'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</span>
              ))}
            </div>

            {DISTRIBUTIONS.map((d, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr',
                padding: '12px 18px',
                borderBottom: '1px solid var(--neutral-100)',
                gap: 8,
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)' }}>{d.period}</span>
                <span style={{ fontSize: 12, color: 'var(--neutral-600, #4a5a52)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.property}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)' }}>{d.gross}</span>
                <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{d.tax}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-600)' }}>{d.net}</span>
                <span style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{d.date}</span>
                <span className={statusPill(d.status, s as Record<string,string>)}>{d.status}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>12-month Distribution Trend</span>
            </div>
            <div className={s.chartWrap} style={{ height: 96 }}>
              {DIST_BARS.map((h, i) => (
                <div key={i} className={s.bar} style={{ height: h ? `${h}%` : '4px', opacity: h ? (i === 11 ? 0.3 : 0.65) : 0.2 }} />
              ))}
            </div>
            <div className={s.chartLabels}>
              {DIST_MONTHS.map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>

        </div>

        {/* Right — totals */}
        <div className={s.rightCol}>
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Summary Totals</span>
            </div>
            {TOTALS.map((g) => (
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
              <span className={s.panelTitle}>Tax Information</span>
            </div>
            <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--neutral-600, #4a5a52)', lineHeight: 1.65 }}>
              <p style={{ marginBottom: 12 }}>
                Rental distributions are subject to <strong style={{ color: 'var(--neutral-800)' }}>15% withholding tax</strong> deducted at source before payment.
              </p>
              <p style={{ marginBottom: 12 }}>
                A tax certificate (IT3(b)) will be issued annually for your SARS submission.
              </p>
              <p>
                Contact support if you require a provisional tax statement.
              </p>
            </div>
            <div className={s.panelFooter}>
              <button className={s.btnOutline}>⬇ Download IT3(b) certificate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
