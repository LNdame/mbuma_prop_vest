import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import s from './page.module.css';
import RunDistributionModal, { type PropertyOption } from './RunDistributionModal';

interface DistRow {
  id: string;
  periodLabel: string;
  status: 'draft' | 'processing' | 'completed';
  processedAt: string | null;
  createdAt: string;
  property: { id: string; title: string } | null;
  totalAmount: number;
  net: number;
  recipients: number;
  lineCount: number;
  paidCount: number;
}
interface DistResponse {
  data: DistRow[];
  summary: {
    totalDistributed: number;
    ytdDistributed: number;
    runCount: number;
    recipientCount: number;
    lastAmount: number;
    lastDate: string | null;
  };
}

function fmt(n: number) {
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function statusLabel(st: string) {
  return st.charAt(0).toUpperCase() + st.slice(1);
}

export default async function DistributionsPage() {
  let res: DistResponse = { data: [], summary: { totalDistributed: 0, ytdDistributed: 0, runCount: 0, recipientCount: 0, lastAmount: 0, lastDate: null } };
  let properties: PropertyOption[] = [];
  try {
    res = await apiFetch<DistResponse>('/api/distributions');
  } catch {
    /* keep defaults */
  }
  try {
    const propsRes = await apiFetch<{ data: PropertyOption[] }>('/api/properties');
    properties = propsRes.data ?? [];
  } catch {
    /* keep defaults */
  }
  const { data, summary } = res;

  const STATS = [
    { label: 'Distributed (net)',  value: fmt(summary.totalDistributed), accent: true  },
    { label: 'YTD distributed',    value: fmt(summary.ytdDistributed),   accent: false },
    { label: 'Distribution runs',  value: String(summary.runCount),      accent: false },
    { label: 'Recipients',         value: String(summary.recipientCount),accent: false },
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Distributions</h1>
          <p className={s.pageSub}>Track rental income distributions to investors</p>
        </div>
        <RunDistributionModal properties={properties} />
      </div>

      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={`${s.statValue} ${st.accent ? s.accent : ''}`}>{st.value}</div>
          </div>
        ))}
      </div>

      <div className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionTitle}>Distribution history</span>
          {summary.lastDate && (
            <span className={s.footNote}>Last run {fmtDate(summary.lastDate)} · {fmt(summary.lastAmount)}</span>
          )}
        </div>
        <div className={s.tableWrap}>
          {data.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--neutral-500)', fontSize: 14 }}>
              No distributions have been run yet.
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Period</th>
                  <th className={s.th}>Property</th>
                  <th className={s.th}>Net amount</th>
                  <th className={s.th}>Recipients</th>
                  <th className={s.th}>Date</th>
                  <th className={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id} className={s.tr}>
                    <td className={s.td}>
                      <Link href={`/admin/distributions/${d.id}`} className={s.runId}>{d.periodLabel}</Link>
                    </td>
                    <td className={s.td}><span className={s.muted}>{d.property?.title ?? '—'}</span></td>
                    <td className={s.td}><span className={s.money}>{fmt(d.net)}</span></td>
                    <td className={s.td}><span className={s.muted}>{d.recipients} {d.recipients === 1 ? 'investor' : 'investors'}</span></td>
                    <td className={s.td}><span className={s.muted}>{fmtDate(d.processedAt ?? d.createdAt)}</span></td>
                    <td className={s.td}>
                      {d.status === 'completed'
                        ? <span className={s.pillSent}>{statusLabel(d.status)}</span>
                        : <span className={s.muted}>{statusLabel(d.status)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
