'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type KycStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
type Filter = 'All' | 'Active' | 'Pending' | 'Verified';

export interface Investor {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  kycStatus: KycStatus;
  isActive: boolean;
  createdAt: string;
  totalInvested: number;
  propertyCount: number;
}

const FILTERS: Filter[] = ['All', 'Active', 'Pending', 'Verified'];
const AVATAR_COLORS = ['av0', 'av1', 'av2', 'av3', 'av4', 'av5', 'av6'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function kycLabel(status: KycStatus) {
  if (status === 'approved') return 'Verified';
  if (status === 'under_review') return 'Under review';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function kycCls(status: KycStatus) {
  if (status === 'approved') return s.kycVerified;
  if (status === 'rejected') return s.kycFailed;
  return s.kycPending; // pending / under_review
}

function fmt(n: number) {
  return n > 0 ? 'R' + n.toLocaleString('en-ZA') : '—';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function InvestorsClient({ investors }: { investors: Investor[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const totalPendingKyc = investors.filter(i => i.kycStatus === 'pending' || i.kycStatus === 'under_review').length;
  const totalActive = investors.filter(i => i.isActive).length;
  const totalInvested = investors.reduce((sum, i) => sum + i.totalInvested, 0);

  const stats = [
    { label: 'Total investors', value: String(investors.length) },
    { label: 'Active',          value: String(totalActive) },
    { label: 'Pending KYC',     value: String(totalPendingKyc) },
    { label: 'Total invested',  value: 'R' + totalInvested.toLocaleString('en-ZA'), accent: true },
  ];

  const filtered = investors
    .filter(inv => {
      if (filter === 'Active')   return inv.isActive;
      if (filter === 'Pending')  return inv.kycStatus === 'pending' || inv.kycStatus === 'under_review' || !inv.isActive;
      if (filter === 'Verified') return inv.kycStatus === 'approved';
      return true;
    })
    .filter(inv => {
      if (!search) return true;
      const q = search.toLowerCase();
      return inv.fullName.toLowerCase().includes(q) || inv.email.toLowerCase().includes(q);
    });

  function handleVerify(id: string) {
    const token = localStorage.getItem('token') ?? '';
    fetch(`${API}/api/investors/${id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.ok) startTransition(() => router.refresh());
    });
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Investors</h1>
          <p className={s.pageSub}>Manage KYC verification, pledges and investor accounts</p>
        </div>
        <Link href="/admin/investors/invite" className={s.btnPrimary}>＋ Invite investor</Link>
      </div>

      <div className={s.statsRow}>
        {stats.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={`${s.statValue} ${st.accent ? s.accent : ''}`}>{st.value}</div>
          </div>
        ))}
      </div>

      <div className={s.toolbar}>
        <div className={s.filterGroup}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${s.filterBtn} ${filter === f ? s.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={s.search}>
          <span className={s.searchIcon}>🔍</span>
          <input
            className={s.searchInput}
            placeholder="Search investors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.th}>Investor</th>
              <th className={s.th}>Status</th>
              <th className={s.th}>KYC</th>
              <th className={s.th}>Properties</th>
              <th className={s.th}>Total invested</th>
              <th className={s.th}>Joined</th>
              <th className={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className={s.td} colSpan={7} style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '32px' }}>
                  No investors match this filter.
                </td>
              </tr>
            ) : filtered.map((inv, i) => (
              <tr key={inv.id} className={`${s.tr} ${isPending ? s.dimmed : ''}`}>
                <td className={s.td}>
                  <div className={s.invCell}>
                    <div className={`${s.avatar} ${s[AVATAR_COLORS[i % AVATAR_COLORS.length]]}`}>
                      {initials(inv.fullName)}
                    </div>
                    <div>
                      <div className={s.invName}>{inv.fullName}</div>
                      <div className={s.invEmail}>{inv.email}</div>
                    </div>
                  </div>
                </td>
                <td className={s.td}>
                  <span className={inv.isActive ? s.pillActive : s.pillPending}>
                    {inv.isActive ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className={s.td}>
                  <span className={kycCls(inv.kycStatus)}>{kycLabel(inv.kycStatus)}</span>
                </td>
                <td className={s.td}><span className={s.muted}>{inv.propertyCount}</span></td>
                <td className={s.td}><span className={s.money}>{fmt(inv.totalInvested)}</span></td>
                <td className={s.td}><span className={s.muted}>{fmtDate(inv.createdAt)}</span></td>
                <td className={s.td}>
                  <div className={s.rowActions}>
                    <Link href={`/admin/investors/${inv.id}`} className={s.btnSm}>View</Link>
                    {inv.kycStatus === 'pending' && (
                      <button className={s.btnSmAccent} onClick={() => handleVerify(inv.id)}>
                        Verify
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
