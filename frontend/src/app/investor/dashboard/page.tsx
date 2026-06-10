'use client';

import s from '../investor.module.css';
import { useMe, type MePledge } from '../../../lib/useMe';

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
function statusPill(status: string, cls: Record<string, string>) {
  if (status === 'open')   return cls.pillOpen;
  if (status === 'funded') return cls.pillFunded;
  return cls.pillClosed;
}
function statusLabel(st: string) {
  return st.charAt(0).toUpperCase() + st.slice(1);
}
function timeAgo(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvestorDashboard() {
  const { me, loading, error } = useMe();

  if (loading) {
    return <div className={s.page}><div className={s.emptyState}>Loading your portfolio…</div></div>;
  }
  if (error === 'unauthenticated') {
    return (
      <div className={s.page}>
        <div className={s.emptyState}>
          Please <a href="/login" className={s.panelLink}>log in</a> to view your dashboard.
        </div>
      </div>
    );
  }
  if (error || !me) {
    return <div className={s.page}><div className={s.emptyState}>Couldn’t load your dashboard. {error}</div></div>;
  }

  const confirmed = me.pledges.filter((p) => p.status === 'confirmed');
  const pending   = me.pledges.filter((p) => p.status === 'pending');
  const holdings: MePledge[] = me.pledges;

  const totalInvested = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);
  const heldProps     = new Map(confirmed.map((p) => [p.property.id, p.property]));
  const propertyCount = heldProps.size;
  const avgYield = heldProps.size
    ? [...heldProps.values()].reduce((s2, p) => s2 + Number(p.projectedYieldPct), 0) / heldProps.size
    : 0;

  const paidLines  = me.distributionLines.filter((l) => l.paymentStatus === 'paid');
  const totalDist  = paidLines.reduce((sum, l) => sum + Number(l.netAmount), 0);
  const thisYear   = new Date().getFullYear();
  const ytdDist    = paidLines
    .filter((l) => l.paidAt && new Date(l.paidAt).getFullYear() === thisYear)
    .reduce((sum, l) => sum + Number(l.netAmount), 0);

  const STATS = [
    { label: 'Available funds',     value: fmtRand(me.availableFunds), sub: 'ready to invest', accent: true },
    { label: 'Total invested',      value: fmtRand(totalInvested), sub: `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`, accent: false },
    { label: 'Avg. projected yield',value: `${avgYield.toFixed(1)}%`, sub: 'gross p.a.', accent: false },
    { label: 'Distributions received', value: fmtRand(totalDist), sub: 'to date', accent: false },
  ];

  const GLANCE = [
    { label: 'Available funds',     value: fmtRand(me.availableFunds), accent: true },
    { label: 'Properties held',     value: String(propertyCount) },
    { label: 'Confirmed pledges',   value: String(confirmed.length) },
    { label: 'Pending pledges',     value: String(pending.length) },
    { label: 'Total distributions', value: fmtRand(totalDist) },
    { label: 'YTD distributions',   value: fmtRand(ytdDist), accent: true },
    { label: 'Active pledges',      value: String(confirmed.length + pending.length) },
  ];

  // Distribution bars grouped by period (most recent 6)
  const byPeriod = new Map<string, number>();
  for (const l of [...paidLines].reverse()) {
    byPeriod.set(l.distribution.periodLabel, (byPeriod.get(l.distribution.periodLabel) ?? 0) + Number(l.netAmount));
  }
  const periods = [...byPeriod.entries()].slice(-6);
  const maxDist = Math.max(1, ...periods.map(([, v]) => v));

  // Activity feed
  const events: { date: string; text: string; dot: 'green' | 'blue' | 'gold' }[] = [];
  for (const p of me.pledges) {
    events.push({
      date: p.confirmedAt ?? p.createdAt,
      text: `Pledge ${p.status} — ${p.property.title}`,
      dot: p.status === 'confirmed' ? 'green' : 'gold',
    });
  }
  for (const l of paidLines) {
    events.push({
      date: l.paidAt ?? l.createdAt,
      text: `${fmtRand(Number(l.netAmount))} received — ${l.distribution.property.title}`,
      dot: 'blue',
    });
  }
  events.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const feed = events.slice(0, 6);

  const firstName = me.fullName.split(/\s+/)[0];

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Welcome back, {firstName} 👋</h1>
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
            <div className={[s.statValue, st.accent ? s.accent : ''].filter(Boolean).join(' ')}>{st.value}</div>
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
            {holdings.length === 0 ? (
              <div className={s.emptyState}>
                You haven’t pledged to any properties yet.{' '}
                <a href="/investor/properties" className={s.panelLink}>Browse properties →</a>
              </div>
            ) : holdings.map((h) => (
              <div key={h.id} className={s.row}>
                <div className={s.rowLeft}>
                  <span className={s.rowIcon}>{propertyIcon(h.property.propertyType)}</span>
                  <div>
                    <div className={s.rowName}>{h.property.title}</div>
                    <div className={s.rowSub}>{typeLabel(h.property.propertyType)} · {fmtRand(Number(h.amount))} pledged{h.status !== 'confirmed' ? ` · ${h.status}` : ''}</div>
                  </div>
                </div>
                <div className={s.rowRight}>
                  <div className={s.progTrack}>
                    <div className={s.progFill} style={{ width: `${fundedPct(h.property.fundedAmount, h.property.targetRaise)}%` }} />
                  </div>
                  <span className={s.propPct}>{fundedPct(h.property.fundedAmount, h.property.targetRaise)}%</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-600)', minWidth: 36 }}>{Number(h.property.projectedYieldPct).toFixed(1)}%</span>
                  <span className={statusPill(h.property.status, s as Record<string, string>)}>{statusLabel(h.property.status)}</span>
                  <a href={`/investor/properties/${h.property.id}`}><button className={s.btnSm}>View</button></a>
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
            {feed.length === 0 ? (
              <div className={s.emptyState}>No activity yet.</div>
            ) : feed.map((f, i) => (
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

        {/* Right */}
        <div className={s.rightCol}>

          {/* Distribution chart */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>My Distributions</span>
              <a href="/investor/distributions" className={s.panelLink}>View all →</a>
            </div>
            {periods.length === 0 ? (
              <div className={s.emptyState}>No distributions paid yet.</div>
            ) : (
              <>
                <div className={s.chartWrap}>
                  {periods.map(([label, v], i) => (
                    <div key={i} className={s.bar} style={{ height: `${Math.max(6, Math.round((v / maxDist) * 100))}%` }} title={`${label}: ${fmtRand(v)}`} />
                  ))}
                </div>
                <div className={s.chartLabels}>
                  {periods.map(([label]) => <span key={label}>{label}</span>)}
                </div>
              </>
            )}
            <div className={s.metaBlock}>
              <div className={s.metaRow}><span className={s.metaLabel}>Distributions received</span><span className={[s.metaVal, s.accent].join(' ')}>{fmtRand(totalDist)}</span></div>
              <div className={s.metaRow}><span className={s.metaLabel}>This year</span><span className={s.metaVal}>{fmtRand(ytdDist)}</span></div>
              <div className={s.metaRow}><span className={s.metaLabel}>Payments</span><span className={s.metaVal}>{paidLines.length}</span></div>
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
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>{g.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
