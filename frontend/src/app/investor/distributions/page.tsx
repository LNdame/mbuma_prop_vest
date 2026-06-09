'use client';

import s from '../investor.module.css';
import { useMe } from '../../../lib/useMe';

function fmtRand(n: number) {
  if (!n) return 'R0';
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fmtDate(d: string | null) {
  if (!d) return 'Not yet paid';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function statusPill(st: string, cls: Record<string, string>) {
  if (st === 'paid')    return cls.pillPaid;
  if (st === 'pending') return cls.pillPending;
  return cls.pillClosed;
}

export default function InvestorDistributions() {
  const { me, loading, error } = useMe();

  if (loading) return <div className={s.page}><div className={s.emptyState}>Loading distributions…</div></div>;
  if (error === 'unauthenticated') return <div className={s.page}><div className={s.emptyState}>Please <a href="/login" className={s.panelLink}>log in</a> to view distributions.</div></div>;
  if (error || !me) return <div className={s.page}><div className={s.emptyState}>Couldn’t load distributions. {error}</div></div>;

  const lines = me.distributionLines;
  const paid  = lines.filter((l) => l.paymentStatus === 'paid');

  const totalGross = lines.reduce((s2, l) => s2 + Number(l.grossAmount), 0);
  const totalTax   = paid.reduce((s2, l) => s2 + Number(l.withholdingTax), 0);
  const totalNet   = paid.reduce((s2, l) => s2 + Number(l.netAmount), 0);
  const year       = new Date().getFullYear();
  const ytdNet     = paid.filter((l) => l.paidAt && new Date(l.paidAt).getFullYear() === year)
                         .reduce((s2, l) => s2 + Number(l.netAmount), 0);
  const lastPaid   = paid.map((l) => l.paidAt).filter(Boolean).sort().slice(-1)[0] ?? null;

  // 12-month trend by paid month
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-ZA', { month: 'short' }) });
  }
  const monthTotals = new Map<string, number>();
  for (const l of paid) {
    if (!l.paidAt) continue;
    const d = new Date(l.paidAt);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    monthTotals.set(k, (monthTotals.get(k) ?? 0) + Number(l.netAmount));
  }
  const maxMonth = Math.max(1, ...months.map((m) => monthTotals.get(m.key) ?? 0));

  const STATS = [
    { label: 'Total received',  value: fmtRand(totalNet), sub: 'net of withholding tax', accent: true  },
    { label: `YTD ${year}`,     value: fmtRand(ytdNet),   sub: 'this year',              accent: true  },
    { label: 'Payments',        value: String(paid.length), sub: 'distributions paid',   accent: false },
    { label: 'Tax withheld',    value: fmtRand(totalTax), sub: 'withholding tax',        accent: false },
  ];

  const TOTALS = [
    { label: 'Total gross distributions', value: fmtRand(totalGross) },
    { label: 'Total withholding tax',     value: fmtRand(totalTax) },
    { label: 'Total net received',        value: fmtRand(totalNet), accent: true },
    { label: `YTD net (${year})`,         value: fmtRand(ytdNet),   accent: true },
    { label: 'Payments received',         value: String(paid.length) },
    { label: 'Last payment date',         value: fmtDate(lastPaid) },
  ];

  const cols = '1fr 1.4fr 0.8fr 0.8fr 0.8fr 0.9fr 0.8fr';

  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Distributions</h1>
          <p className={s.pageSub}>Your rental income history and payments</p>
        </div>
      </div>

      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={[s.statValue, st.accent ? s.accent : ''].filter(Boolean).join(' ')}>{st.value}</div>
            <div className={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div className={s.mainGrid}>
        <div className={s.leftCol}>

          {/* History table */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Distribution History</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{lines.length} {lines.length === 1 ? 'record' : 'records'}</span>
            </div>

            {lines.length === 0 ? (
              <div className={s.emptyState}>No distributions yet. Income appears here once a property pays out.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '8px 18px', background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-100)', gap: 8 }}>
                  {['Period', 'Property', 'Gross', 'Tax', 'Net', 'Date', 'Status'].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</span>
                  ))}
                </div>
                {lines.map((d) => (
                  <div key={d.id} style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 18px', borderBottom: '1px solid var(--neutral-100)', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)' }}>{d.distribution.periodLabel}</span>
                    <span style={{ fontSize: 12, color: 'var(--neutral-600, #4a5a52)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.distribution.property.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)' }}>{fmtRand(Number(d.grossAmount))}</span>
                    <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{fmtRand(Number(d.withholdingTax))}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-600)' }}>{fmtRand(Number(d.netAmount))}</span>
                    <span style={{ fontSize: 11, color: 'var(--neutral-500)' }}>{fmtDate(d.paidAt)}</span>
                    <span className={statusPill(d.paymentStatus, s as Record<string, string>)} style={{ textTransform: 'capitalize' }}>{d.paymentStatus}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Chart */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>12-month Distribution Trend</span></div>
            <div className={s.chartWrap} style={{ height: 96 }}>
              {months.map((m, i) => {
                const v = monthTotals.get(m.key) ?? 0;
                return <div key={i} className={s.bar} style={{ height: v ? `${Math.max(6, Math.round((v / maxMonth) * 100))}%` : '4px', opacity: v ? 0.7 : 0.2 }} title={`${m.label}: ${fmtRand(v)}`} />;
              })}
            </div>
            <div className={s.chartLabels}>
              {months.map((m, i) => <span key={i}>{m.label}</span>)}
            </div>
          </div>

        </div>

        {/* Totals */}
        <div className={s.rightCol}>
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Summary Totals</span></div>
            {TOTALS.map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>{g.value}</span>
              </div>
            ))}
          </div>

          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Tax Information</span></div>
            <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--neutral-600, #4a5a52)', lineHeight: 1.65 }}>
              <p style={{ marginBottom: 12 }}>
                Rental distributions are subject to <strong style={{ color: 'var(--neutral-800)' }}>withholding tax</strong> deducted at source before payment.
              </p>
              <p>A tax certificate (IT3(b)) is issued annually for your SARS submission.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
