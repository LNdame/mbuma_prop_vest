'use client';

import { useState } from 'react';
import Link from 'next/link';
import s from './page.module.css';

type PropertyStatus = 'draft' | 'open' | 'funded' | 'closed';
type PropertyType   = 'residential' | 'commercial' | 'mixed_use';
type Filter = 'All' | 'Open' | 'Funded' | 'Draft';

export interface Property {
  id: string;
  title: string;
  address: string;
  province: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  targetRaise: string;
  fundedAmount: string;
  projectedYieldPct: string;
  createdAt: string;
  investorCount: number;
}

const FILTERS: Filter[] = ['All', 'Open', 'Funded', 'Draft'];

function propertyIcon(type: PropertyType) {
  if (type === 'commercial') return '🏢';
  if (type === 'mixed_use')  return '🏗';
  return '🏘';
}

function statusLabel(status: PropertyStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusCls(status: PropertyStatus) {
  if (status === 'open')   return s.pillOpen;
  if (status === 'funded') return s.pillFunded;
  return s.pillDraft;
}

function typeLabel(type: PropertyType) {
  if (type === 'mixed_use') return 'Mixed use';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function pct(funded: string, target: string) {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(funded) / t) * 100));
}

function fmt(n: number) {
  return n > 0 ? 'R' + n.toLocaleString('en-ZA') : '—';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function PropertiesClient({ properties }: { properties: Property[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total properties', value: String(properties.length) },
    { label: 'Open raises',      value: String(properties.filter(p => p.status === 'open').length) },
    { label: 'Fully funded',     value: String(properties.filter(p => p.status === 'funded').length) },
    { label: 'Drafts',           value: String(properties.filter(p => p.status === 'draft').length) },
  ];

  const filtered = properties
    .filter(p => {
      if (filter === 'Open')   return p.status === 'open';
      if (filter === 'Funded') return p.status === 'funded';
      if (filter === 'Draft')  return p.status === 'draft';
      return true;
    })
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q)
      );
    });

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Properties</h1>
          <p className={s.pageSub}>Manage listings, track funding progress and yields</p>
        </div>
        <Link href="/admin/properties/new" className={s.btnPrimary}>＋ New property</Link>
      </div>

      <div className={s.statsRow}>
        {stats.map(st => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={s.statValue}>{st.value}</div>
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
            placeholder="Search properties…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.th}>Property</th>
              <th className={s.th}>Type</th>
              <th className={s.th}>Status</th>
              <th className={s.th}>Funding</th>
              <th className={s.th}>Raised</th>
              <th className={s.th}>Target</th>
              <th className={s.th}>Yield</th>
              <th className={s.th}>Investors</th>
              <th className={s.th}>Listed</th>
              <th className={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className={s.td} colSpan={10} style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '32px' }}>
                  No properties match this filter.
                </td>
              </tr>
            ) : filtered.map(p => {
              const fundedPct = pct(p.fundedAmount, p.targetRaise);
              return (
                <tr key={p.id} className={s.tr}>
                  <td className={s.td}>
                    <div className={s.propCell}>
                      <span className={s.propIcon}>{propertyIcon(p.propertyType)}</span>
                      <div>
                        <div className={s.propName}>{p.title}</div>
                        <div className={s.propAddr}>{p.address}, {p.province}</div>
                      </div>
                    </div>
                  </td>
                  <td className={s.td}><span className={s.typeTag}>{typeLabel(p.propertyType)}</span></td>
                  <td className={s.td}><span className={statusCls(p.status)}>{statusLabel(p.status)}</span></td>
                  <td className={s.td}>
                    <div className={s.progCell}>
                      <div className={s.progTrack}>
                        <div className={s.progFill} style={{ width: `${fundedPct}%` }} />
                      </div>
                      <span className={s.progPct}>{fundedPct}%</span>
                    </div>
                  </td>
                  <td className={s.td}><span className={s.money}>{fmt(Number(p.fundedAmount))}</span></td>
                  <td className={s.td}><span className={s.muted}>{fmt(Number(p.targetRaise))}</span></td>
                  <td className={s.td}><span className={s.yieldVal}>{Number(p.projectedYieldPct).toFixed(1)}%</span></td>
                  <td className={s.td}><span className={s.muted}>{p.investorCount}</span></td>
                  <td className={s.td}><span className={s.muted}>{fmtDate(p.createdAt)}</span></td>
                  <td className={s.td}>
                    <div className={s.rowActions}>
                      <Link href={`/admin/properties/${p.id}`} className={s.btnSm}>
                        {p.status === 'draft' ? 'Edit' : 'View'}
                      </Link>
                      {p.status !== 'draft' && (
                        <Link href={`/admin/properties/${p.id}/edit`} className={s.btnSm}>Edit</Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
