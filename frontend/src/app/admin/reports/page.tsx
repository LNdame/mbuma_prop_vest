import { apiFetch } from '@/lib/api';
import s from '../distributions/page.module.css';

interface ReportData {
  totals: { properties: number; investors: number; totalRaised: number; totalTarget: number };
  distributions: { gross: number; tax: number; net: number };
  propertiesByStatus: { status: string; count: number; raised: number }[];
  investorsByKyc: { kycStatus: string; count: number }[];
  pledgesByStatus: { status: string; count: number; amount: number }[];
  topProperties: { id: string; title: string; status: string; propertyType: string; fundedAmount: number; targetRaise: number }[];
}

function fmt(n: number) {
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fmtShort(n: number) {
  if (n >= 1_000_000) return 'R' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000)     return 'R' + Math.round(n / 1_000) + 'k';
  return 'R' + Math.round(n);
}
function cap(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.min(100, Math.round((a / b) * 100));
}

export default async function AdminReportsPage() {
  let r: ReportData | null = null;
  try {
    r = await apiFetch<ReportData>('/api/reports');
  } catch {
    r = null;
  }

  if (!r) {
    return (
      <div className={s.page}>
        <div className={s.pageHeader}><div><h1 className={s.pageTitle}>Reports</h1><p className={s.pageSub}>Platform analytics</p></div></div>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--neutral-500)' }}>Couldn’t load reports.</div>
      </div>
    );
  }

  const totalPledged = r.pledgesByStatus.reduce((s2, p) => s2 + p.amount, 0);
  const totalPledges = r.pledgesByStatus.reduce((s2, p) => s2 + p.count, 0);

  const KPIS = [
    { label: 'Total raised',        value: fmt(r.totals.totalRaised), sub: `of ${fmtShort(r.totals.totalTarget)} target`, accent: true },
    { label: 'Properties',          value: String(r.totals.properties), sub: 'listed' },
    { label: 'Investors',           value: String(r.totals.investors), sub: 'registered' },
    { label: 'Distributions paid',  value: fmt(r.distributions.net), sub: 'net to investors', accent: true },
  ];

  const maxPropRaised = Math.max(1, ...r.propertiesByStatus.map((p) => p.raised));
  const maxKyc = Math.max(1, ...r.investorsByKyc.map((k) => k.count));

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Reports</h1>
          <p className={s.pageSub}>Platform performance and analytics</p>
        </div>
      </div>

      {/* KPIs */}
      <div className={s.statsRow}>
        {KPIS.map((k) => (
          <div key={k.label} className={s.statCard}>
            <div className={s.statLabel}>{k.label}</div>
            <div className={`${s.statValue} ${k.accent ? s.accent : ''}`}>{k.value}</div>
            <div className={s.muted} style={{ fontSize: 12, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Capital raised progress */}
      <div className={s.section}>
        <div className={s.sectionHead}><span className={s.sectionTitle}>Capital raised vs target</span></div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span className={s.money}>{fmt(r.totals.totalRaised)} raised</span>
            <span className={s.muted}>{pct(r.totals.totalRaised, r.totals.totalTarget)}% of {fmt(r.totals.totalTarget)}</span>
          </div>
          <div style={{ height: 12, background: 'var(--neutral-100)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(r.totals.totalRaised, r.totals.totalTarget)}%`, background: 'var(--green-500)', borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Two-column breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Properties by status */}
        <div className={s.section}>
          <div className={s.sectionHead}><span className={s.sectionTitle}>Properties by status</span></div>
          <div style={{ padding: '8px 18px 18px' }}>
            {r.propertiesByStatus.map((p) => (
              <div key={p.status} style={{ padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)', textTransform: 'capitalize' }}>{cap(p.status)} · {p.count}</span>
                  <span className={s.muted}>{fmt(p.raised)}</span>
                </div>
                <div style={{ height: 7, background: 'var(--neutral-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(p.raised, maxPropRaised)}%`, background: 'var(--green-500)', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investors by KYC */}
        <div className={s.section}>
          <div className={s.sectionHead}><span className={s.sectionTitle}>Investors by KYC status</span></div>
          <div style={{ padding: '8px 18px 18px' }}>
            {r.investorsByKyc.map((k) => (
              <div key={k.kycStatus} style={{ padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)', textTransform: 'capitalize' }}>{cap(k.kycStatus)}</span>
                  <span className={s.muted}>{k.count} {k.count === 1 ? 'investor' : 'investors'}</span>
                </div>
                <div style={{ height: 7, background: 'var(--neutral-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(k.count, maxKyc)}%`, background: 'var(--green-500)', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pledges summary */}
      <div className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionTitle}>Pledges</span>
          <span className={s.footNote}>{totalPledges} pledges · {fmt(totalPledged)} total</span>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>Status</th>
                <th className={s.th}>Count</th>
                <th className={s.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.pledgesByStatus.length === 0 ? (
                <tr className={s.tr}><td className={s.td} colSpan={3}><span className={s.muted}>No pledges yet.</span></td></tr>
              ) : r.pledgesByStatus.map((p) => (
                <tr key={p.status} className={s.tr}>
                  <td className={s.td}><span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{cap(p.status)}</span></td>
                  <td className={s.td}><span className={s.muted}>{p.count}</span></td>
                  <td className={s.td}><span className={s.money}>{fmt(p.amount)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top properties */}
      <div className={s.section}>
        <div className={s.sectionHead}><span className={s.sectionTitle}>Top properties by capital raised</span></div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>Property</th>
                <th className={s.th}>Type</th>
                <th className={s.th}>Raised</th>
                <th className={s.th}>Target</th>
                <th className={s.th}>Funded</th>
              </tr>
            </thead>
            <tbody>
              {r.topProperties.length === 0 ? (
                <tr className={s.tr}><td className={s.td} colSpan={5}><span className={s.muted}>No properties yet.</span></td></tr>
              ) : r.topProperties.map((p) => (
                <tr key={p.id} className={s.tr}>
                  <td className={s.td}><a href={`/admin/properties/${p.id}`} className={s.invName} style={{ textDecoration: 'none' }}>{p.title}</a></td>
                  <td className={s.td}><span className={s.muted} style={{ textTransform: 'capitalize' }}>{p.propertyType.replace('_', '-')}</span></td>
                  <td className={s.td}><span className={s.money}>{fmt(p.fundedAmount)}</span></td>
                  <td className={s.td}><span className={s.muted}>{fmt(p.targetRaise)}</span></td>
                  <td className={s.td}><span className={s.muted}>{pct(p.fundedAmount, p.targetRaise)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
