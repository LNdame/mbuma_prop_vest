'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface DistLine {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  pledgeAmount: number;
  grossAmount: number;
  withholdingTax: number;
  netAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paidAt: string | null;
}

export interface DistDetail {
  id: string;
  periodLabel: string;
  status: 'draft' | 'processing' | 'completed';
  totalAmount: number;
  notes: string | null;
  processedAt: string | null;
  createdAt: string;
  createdBy: string;
  property: { id: string; title: string } | null;
  lines: DistLine[];
}

function fmt(n: number) {
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AVATAR_COLORS = ['av0', 'av1', 'av2', 'av3', 'av4', 'av5', 'av6'];
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function statusPill(status: string) {
  if (status === 'completed')  return s.pillCompleted;
  if (status === 'processing') return s.pillProcessing;
  return s.pillDraft;
}
function paymentPill(status: string) {
  if (status === 'paid')   return s.pillPaid;
  if (status === 'failed') return s.pillFailed;
  return s.pillPending;
}
function paymentLabel(status: string) {
  if (status === 'paid')   return 'Allocated';
  if (status === 'failed') return 'Failed';
  return 'Pending';
}

function token() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
}

export default function DistributionDetailClient({ dist: initial }: { dist: DistDetail }) {
  const router = useRouter();
  const [dist, setDist] = useState<DistDetail>(initial);
  const [loadingLine, setLoadingLine] = useState<string | null>(null);
  const [loadingAll, startAll] = useTransition();
  const [error, setError] = useState('');

  const totalGross   = dist.lines.reduce((s, l) => s + l.grossAmount, 0);
  const totalTax     = dist.lines.reduce((s, l) => s + l.withholdingTax, 0);
  const totalNet     = dist.lines.reduce((s, l) => s + l.netAmount, 0);
  const paidCount    = dist.lines.filter((l) => l.paymentStatus === 'paid').length;  // "allocated" in UI
  const pendingCount = dist.lines.filter((l) => l.paymentStatus === 'pending').length;
  const isCompleted  = dist.status === 'completed';

  async function markLine(lineId: string, status: 'paid' | 'failed') {
    setError('');
    setLoadingLine(lineId);
    try {
      const res = await fetch(`${API}/api/distributions/${dist.id}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Failed to update'); return; }

      const now = new Date().toISOString();
      setDist((prev) => {
        const lines = prev.lines.map((l) =>
          l.id === lineId ? { ...l, paymentStatus: status, paidAt: status === 'paid' ? now : null } : l
        );
        const allPaid = lines.every((l) => l.paymentStatus === 'paid');
        return { ...prev, lines, status: allPaid ? 'completed' : prev.status, processedAt: allPaid ? now : prev.processedAt };
      });
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoadingLine(null);
    }
  }

  function markAllPaid() {
    setError('');
    startAll(async () => {
      try {
        const res = await fetch(`${API}/api/distributions/${dist.id}/mark-all-paid`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) { setError('Failed to allocate funds'); return; }
        router.refresh();
      } catch {
        setError('Could not reach the server.');
      }
    });
  }

  const STATS = [
    { label: 'Total gross',  value: fmt(totalGross) },
    { label: 'Tax withheld', value: fmt(totalTax) },
    { label: 'Total net',    value: fmt(totalNet), accent: true },
    { label: 'Recipients',   value: String(dist.lines.length) },
  ];

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <Link href="/admin/distributions" className={s.backLink}>← Distributions</Link>
      </div>

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.heroIcon}>💸</div>
          <div>
            <div className={s.heroTitle}>{dist.periodLabel}</div>
            <div className={s.heroMeta}>
              {dist.property?.title ?? 'Unknown property'} · Created by {dist.createdBy} · {fmtDate(dist.createdAt)}
            </div>
          </div>
        </div>
        <div className={s.heroRight}>
          <span className={statusPill(dist.status)}>
            {dist.status.charAt(0).toUpperCase() + dist.status.slice(1)}
          </span>
          {dist.processedAt && (
            <span className={s.heroNote}>Completed {fmtDate(dist.processedAt)}</span>
          )}
          {dist.notes && <span className={s.heroNote}>{dist.notes}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={`${s.statValue} ${st.accent ? s.accent : ''}`}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Lines table */}
      <div className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <span className={s.sectionTitle}>Per-investor breakdown</span>
            <span className={s.sectionSub}>{dist.lines.length} {dist.lines.length === 1 ? 'investor' : 'investors'} · {paidCount} allocated</span>
          </div>
          {!isCompleted && pendingCount > 0 && (
            <button className={s.btnMarkAll} onClick={markAllPaid} disabled={loadingAll}>
              {loadingAll ? 'Updating…' : `Allocate all (${pendingCount})`}
            </button>
          )}
          {isCompleted && (
            <span className={s.completedBadge}>✓ All funds allocated</span>
          )}
        </div>

        {error && <p className={s.errorMsg}>{error}</p>}

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>Investor</th>
                <th className={s.th}>Pledge</th>
                <th className={s.th}>Gross</th>
                <th className={s.th}>Tax (15%)</th>
                <th className={s.th}>Net</th>
                <th className={s.th}>Status</th>
                <th className={s.th}>Allocated on</th>
                {!isCompleted && <th className={s.th}></th>}
              </tr>
            </thead>
            <tbody>
              {dist.lines.map((l, i) => {
                const isLoading = loadingLine === l.id;
                return (
                  <tr key={l.id} className={s.tr}>
                    <td className={s.td}>
                      <div className={s.invCell}>
                        <div className={`${s.avatar} ${s[AVATAR_COLORS[i % AVATAR_COLORS.length]]}`}>
                          {initials(l.fullName)}
                        </div>
                        <div>
                          <div className={s.invName}>{l.fullName}</div>
                          <div className={s.invEmail}>{l.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={s.td}><span className={s.muted}>{fmt(l.pledgeAmount)}</span></td>
                    <td className={s.td}><span className={s.muted}>{fmt(l.grossAmount)}</span></td>
                    <td className={s.td}><span className={s.muted}>{fmt(l.withholdingTax)}</span></td>
                    <td className={s.td}><span className={s.money}>{fmt(l.netAmount)}</span></td>
                    <td className={s.td}><span className={paymentPill(l.paymentStatus)}>{paymentLabel(l.paymentStatus)}</span></td>
                    <td className={s.td}><span className={s.muted}>{fmtDate(l.paidAt)}</span></td>
                    {!isCompleted && (
                      <td className={s.td}>
                        {l.paymentStatus === 'pending' && (
                          <div className={s.lineActions}>
                            <button
                              className={s.btnPay}
                              onClick={() => markLine(l.id, 'paid')}
                              disabled={isLoading}
                            >
                              {isLoading ? '…' : 'Allocate'}
                            </button>
                            <button
                              className={s.btnFail}
                              onClick={() => markLine(l.id, 'failed')}
                              disabled={isLoading}
                            >
                              {isLoading ? '…' : 'Failed'}
                            </button>
                          </div>
                        )}
                        {l.paymentStatus === 'failed' && (
                          <button
                            className={s.btnPay}
                            onClick={() => markLine(l.id, 'paid')}
                            disabled={isLoading}
                          >
                            {isLoading ? '…' : 'Retry allocation'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
