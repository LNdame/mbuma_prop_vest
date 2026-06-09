import type { CSSProperties } from 'react';
import { apiFetch } from '@/lib/api';
import s from '../distributions/page.module.css';

interface Agreement {
  id: string;
  fileName: string;
  signingStatus: 'pending' | 'sent' | 'signed' | 'declined';
  signedAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  property: { id: string; title: string } | null;
  downloadUrl: string;
}
interface AgreementsResponse {
  data: Agreement[];
  summary: { total: number; signed: number; pending: number; declined: number };
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
function signingStyle(st: string): CSSProperties {
  const base: CSSProperties = { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, textTransform: 'capitalize' };
  if (st === 'signed')   return { ...base, background: 'var(--green-100)', color: 'var(--green-700)' };
  if (st === 'declined') return { ...base, background: '#fde8e6', color: '#b42318' };
  return { ...base, background: '#fef3cd', color: '#9a6700' }; // pending / sent
}

const AVATAR_COLORS = ['av0', 'av1', 'av2', 'av3', 'av4', 'av5', 'av6'];

export default async function AdminAgreementsPage() {
  let res: AgreementsResponse = { data: [], summary: { total: 0, signed: 0, pending: 0, declined: 0 } };
  try {
    res = await apiFetch<AgreementsResponse>('/api/agreements');
  } catch {
    /* keep defaults */
  }
  const { data, summary } = res;

  const STATS = [
    { label: 'Total agreements',   value: String(summary.total),    accent: false },
    { label: 'Signed',             value: String(summary.signed),   accent: true  },
    { label: 'Awaiting signature', value: String(summary.pending),  accent: false },
    { label: 'Declined',           value: String(summary.declined), accent: false },
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Agreements</h1>
          <p className={s.pageSub}>Investment agreements and their signing status</p>
        </div>
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
          <span className={s.sectionTitle}>All agreements</span>
        </div>
        <div className={s.tableWrap}>
          {data.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--neutral-500)', fontSize: 14 }}>
              No agreements yet. Investment agreements appear here once generated.
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Investor</th>
                  <th className={s.th}>Document</th>
                  <th className={s.th}>Property</th>
                  <th className={s.th}>Date</th>
                  <th className={s.th}>Status</th>
                  <th className={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {data.map((a, i) => (
                  <tr key={a.id} className={s.tr}>
                    <td className={s.td}>
                      <div className={s.invCell}>
                        <div className={`${s.avatar} ${s[AVATAR_COLORS[i % AVATAR_COLORS.length]]}`}>{initials(a.user.fullName)}</div>
                        <span className={s.invName}>{a.user.fullName}</span>
                      </div>
                    </td>
                    <td className={s.td}><span className={s.muted}>{a.fileName}</span></td>
                    <td className={s.td}><span className={s.muted}>{a.property?.title ?? '—'}</span></td>
                    <td className={s.td}><span className={s.muted}>{fmtDate(a.signedAt ?? a.createdAt)}</span></td>
                    <td className={s.td}><span style={signingStyle(a.signingStatus)}>{a.signingStatus}</span></td>
                    <td className={s.td}>
                      <a href={a.downloadUrl} target="_blank" rel="noopener noreferrer"><button className={s.btnSm}>View</button></a>
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
