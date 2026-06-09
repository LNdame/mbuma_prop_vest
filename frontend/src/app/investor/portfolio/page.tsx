'use client';

import s from '../investor.module.css';
import { useMe } from '../../../lib/useMe';

function fmtRand(n: number) {
  if (!n) return 'R0';
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fundedPct(funded: string, target: string) {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(funded) / t) * 100));
}
function typeLabel(t: string) {
  if (t === 'mixed_use') return 'Mixed use';
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function propertyIcon(t: string) {
  if (t === 'commercial') return '🏢';
  if (t === 'mixed_use')  return '🏗';
  return '🏘';
}
function statusPill(st: string, cls: Record<string, string>) {
  if (st === 'confirmed') return cls.pillConfirmed;
  if (st === 'pending')   return cls.pillPending;
  return cls.pillClosed;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvestorPortfolio() {
  const { me, loading, error } = useMe();

  if (loading) return <div className={s.page}><div className={s.emptyState}>Loading your portfolio…</div></div>;
  if (error === 'unauthenticated') return <div className={s.page}><div className={s.emptyState}>Please <a href="/login" className={s.panelLink}>log in</a> to view your portfolio.</div></div>;
  if (error || !me) return <div className={s.page}><div className={s.emptyState}>Couldn’t load your portfolio. {error}</div></div>;

  const confirmed = me.pledges.filter((p) => p.status === 'confirmed');
  const pending   = me.pledges.filter((p) => p.status === 'pending');
  const totalInvested = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);

  const paidLines = me.distributionLines.filter((l) => l.paymentStatus === 'paid');
  const totalDist = paidLines.reduce((sum, l) => sum + Number(l.netAmount), 0);
  const distByPledge = new Map<string, number>();
  for (const l of paidLines) distByPledge.set(l.pledgeId, (distByPledge.get(l.pledgeId) ?? 0) + Number(l.netAmount));

  const heldProps = new Map(confirmed.map((p) => [p.property.id, p.property]));
  const avgYield = heldProps.size
    ? [...heldProps.values()].reduce((a, p) => a + Number(p.projectedYieldPct), 0) / heldProps.size
    : 0;

  // Allocation by property type (confirmed)
  const byType = new Map<string, number>();
  for (const p of confirmed) byType.set(p.property.propertyType, (byType.get(p.property.propertyType) ?? 0) + Number(p.amount));
  const allocation = [...byType.entries()].map(([type, amount]) => ({
    type: typeLabel(type), amount, pct: totalInvested ? Math.round((amount / totalInvested) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const STATS = [
    { label: 'Total invested',        value: fmtRand(totalInvested), sub: `${heldProps.size} ${heldProps.size === 1 ? 'property' : 'properties'}`, accent: false },
    { label: 'Distributions received',value: fmtRand(totalDist), sub: 'all distributions', accent: true },
    { label: 'Avg. yield',            value: `${avgYield.toFixed(1)}%`, sub: 'gross p.a.', accent: false },
    { label: 'Active pledges',        value: String(confirmed.length + pending.length), sub: `${confirmed.length} confirmed`, accent: false },
  ];

  const SUMMARY = [
    { label: 'Total pledged',          value: fmtRand(totalInvested) },
    { label: 'Distributions received', value: fmtRand(totalDist), accent: true },
    { label: 'Properties held',        value: String(heldProps.size) },
    { label: 'Confirmed pledges',      value: String(confirmed.length) },
    { label: 'Pending pledges',        value: String(pending.length) },
    { label: 'Avg. yield',             value: `${avgYield.toFixed(1)}%`, accent: true },
  ];

  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>My Portfolio</h1>
          <p className={s.pageSub}>Your pledges and investment performance</p>
        </div>
        <a href="/investor/properties"><button className={s.btnPrimary}>＋ New investment</button></a>
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

        {/* Pledges */}
        <div className={s.leftCol}>
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>My Pledges</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{me.pledges.length} {me.pledges.length === 1 ? 'pledge' : 'pledges'}</span>
            </div>

            {me.pledges.length === 0 ? (
              <div className={s.emptyState}>
                You haven’t pledged to any properties yet.{' '}
                <a href="/investor/properties" className={s.panelLink}>Browse properties →</a>
              </div>
            ) : me.pledges.map((p) => (
              <div key={p.id} style={{ padding: '16px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span className={s.rowIcon}>{propertyIcon(p.property.propertyType)}</span>
                    <div>
                      <div className={s.rowName}>{p.property.title}</div>
                      <div className={s.rowSub}>{typeLabel(p.property.propertyType)} · {p.property.province}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className={statusPill(p.status, s as Record<string, string>)} style={{ textTransform: 'capitalize' }}>{p.status}</span>
                    <a href={`/investor/properties/${p.property.id}`}><button className={s.btnSm}>View</button></a>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Pledged</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-900)' }}>{fmtRand(Number(p.amount))}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Yield</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neutral-900)' }}>{Number(p.property.projectedYieldPct).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Distributions</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--green-600)' }}>{fmtRand(distByPledge.get(p.id) ?? 0)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--neutral-500)', marginBottom: 2 }}>Pledged on</div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--neutral-700)' }}>{fmtDate(p.createdAt)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-500)', marginBottom: 4 }}>
                    <span>Property funding progress</span>
                    <span>{fundedPct(p.property.fundedAmount, p.property.targetRaise)}%</span>
                  </div>
                  <div className={s.fundingBarTrack}>
                    <div className={s.fundingBarFill} style={{ width: `${fundedPct(p.property.fundedAmount, p.property.targetRaise)}%` }} />
                  </div>
                </div>
              </div>
            ))}

            <div className={s.panelFooter}>
              <a href="/investor/properties"><button className={s.btnOutline}>＋ Invest in another property</button></a>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={s.rightCol}>
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Portfolio Summary</span></div>
            {SUMMARY.map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>{g.value}</span>
              </div>
            ))}
          </div>

          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Allocation by Type</span></div>
            {allocation.length === 0 ? (
              <div className={s.emptyState}>No confirmed holdings yet.</div>
            ) : allocation.map((a) => (
              <div key={a.type} style={{ padding: '12px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, color: 'var(--neutral-800)' }}>{a.type}</span>
                  <span style={{ color: 'var(--neutral-500)' }}>{fmtRand(a.amount)} · {a.pct}%</span>
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
