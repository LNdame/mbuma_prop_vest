import s from './page.module.css';

const STATS = [
  { label: 'Total properties', value: '4' },
  { label: 'Open raises',      value: '2' },
  { label: 'Fully funded',     value: '1' },
  { label: 'Drafts',           value: '1' },
];

const PROPERTIES = [
  { id: 'P001', icon: '🏘', name: '14 Fern Close, Fourways',    address: 'Fourways, Gauteng', type: 'Residential', status: 'Open',   investors: 6, target: 3_800_000, raised: 2_736_000, pct: 72,  yieldPct: '9.2%',  listed: '12 Mar 2025' },
  { id: 'P002', icon: '🏢', name: 'Shop 4, Kyalami Corner',     address: 'Kyalami, Gauteng',  type: 'Commercial',  status: 'Open',   investors: 4, target: 5_000_000, raised: 1_900_000, pct: 38,  yieldPct: '10.8%', listed: '28 May 2025' },
  { id: 'P003', icon: '🏘', name: 'Unit 7, Sandton Gardens',    address: 'Sandton, Gauteng',  type: 'Residential', status: 'Funded', investors: 8, target: 3_100_000, raised: 3_100_000, pct: 100, yieldPct: '8.7%',  listed: '4 Jan 2025'  },
  { id: 'P004', icon: '🏡', name: 'New listing — Bryanston',    address: 'Bryanston, Gauteng',type: 'Residential', status: 'Draft',  investors: 0, target: 4_500_000, raised: 0,         pct: 0,   yieldPct: '9.5%',  listed: '—'           },
];

function fmt(n: number) { return n > 0 ? 'R' + n.toLocaleString('en-ZA') : '—'; }

function statusCls(status: string, styles: Record<string, string>) {
  if (status === 'Open')   return styles.pillOpen;
  if (status === 'Funded') return styles.pillFunded;
  return styles.pillDraft;
}

export default function PropertiesPage() {
  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Properties</h1>
          <p className={s.pageSub}>Manage listings, track funding progress and yields</p>
        </div>
        <a href="/admin/properties/new"><button className={s.btnPrimary}>＋ New property</button></a>
      </div>

      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={s.statValue}>{st.value}</div>
          </div>
        ))}
      </div>

      <div className={s.toolbar}>
        <div className={s.filterGroup}>
          {['All', 'Open', 'Funded', 'Draft'].map((f) => (
            <button key={f} className={`${s.filterBtn} ${f === 'All' ? s.filterActive : ''}`}>{f}</button>
          ))}
        </div>
        <div className={s.search}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.searchInput} placeholder="Search properties…" readOnly />
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
            {PROPERTIES.map((p) => (
              <tr key={p.id} className={s.tr}>
                <td className={s.td}>
                  <div className={s.propCell}>
                    <span className={s.propIcon}>{p.icon}</span>
                    <div>
                      <div className={s.propName}>{p.name}</div>
                      <div className={s.propAddr}>{p.address}</div>
                    </div>
                  </div>
                </td>
                <td className={s.td}><span className={s.typeTag}>{p.type}</span></td>
                <td className={s.td}><span className={statusCls(p.status, s)}>{p.status}</span></td>
                <td className={s.td}>
                  <div className={s.progCell}>
                    <div className={s.progTrack}><div className={s.progFill} style={{ width: `${p.pct}%` }} /></div>
                    <span className={s.progPct}>{p.pct}%</span>
                  </div>
                </td>
                <td className={s.td}><span className={s.money}>{fmt(p.raised)}</span></td>
                <td className={s.td}><span className={s.muted}>{fmt(p.target)}</span></td>
                <td className={s.td}><span className={s.yieldVal}>{p.yieldPct}</span></td>
                <td className={s.td}><span className={s.muted}>{p.investors}</span></td>
                <td className={s.td}><span className={s.muted}>{p.listed}</span></td>
                <td className={s.td}>
                  <div className={s.rowActions}>
                    <button className={s.btnSm}>{p.status === 'Draft' ? 'Edit' : 'View'}</button>
                    {p.status !== 'Draft' && <button className={s.btnSm}>Edit</button>}
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
