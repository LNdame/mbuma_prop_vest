import s from './page.module.css';

const STATS = [
  { label: 'Total investors',   value: '14' },
  { label: 'Active',            value: '11' },
  { label: 'Pending KYC',       value: '2'  },
  { label: 'Total invested',    value: 'R1.82M', accent: true },
];

const INVESTORS = [
  { initials: 'SK', name: 'S. Khumalo',    email: 'skhumalo@gmail.com',   properties: 2, invested: 350_000, status: 'Active',  kyc: 'Verified',   joined: '10 Jan 2025' },
  { initials: 'PN', name: 'P. Nkosi',      email: 'pnkosi@outlook.com',   properties: 1, invested: 150_000, status: 'Active',  kyc: 'Verified',   joined: '15 Jan 2025' },
  { initials: 'AM', name: 'A. Molefe',     email: 'amolefe@gmail.com',    properties: 2, invested: 300_000, status: 'Active',  kyc: 'Verified',   joined: '2 Feb 2025'  },
  { initials: 'TM', name: 'T. Mahlangu',  email: 'tmahlangu@webmail.co.za', properties: 1, invested: 200_000, status: 'Active',  kyc: 'Verified',   joined: '18 Feb 2025' },
  { initials: 'NZ', name: 'N. Zulu',      email: 'nzulu@icloud.com',      properties: 2, invested: 420_000, status: 'Active',  kyc: 'Verified',   joined: '5 Mar 2025'  },
  { initials: 'LM', name: 'L. Mokoena',  email: 'lmokoena@gmail.com',    properties: 1, invested: 100_000, status: 'Active',  kyc: 'Verified',   joined: '20 Mar 2025' },
  { initials: 'BN', name: 'B. Ndlovu',   email: 'bndlovu@gmail.com',     properties: 1, invested: 75_000,  status: 'Active',  kyc: 'Verified',   joined: '1 Apr 2025'  },
  { initials: 'CS', name: 'C. Sithole',  email: 'csithole@gmail.com',    properties: 1, invested: 50_000,  status: 'Active',  kyc: 'Verified',   joined: '14 Apr 2025' },
  { initials: 'MK', name: 'M. Kgosi',    email: 'mkgosi@gmail.com',      properties: 1, invested: 125_000, status: 'Active',  kyc: 'Verified',   joined: '22 Apr 2025' },
  { initials: 'FD', name: 'F. Dlamini',  email: 'fdlamini@gmail.com',    properties: 1, invested: 50_000,  status: 'Active',  kyc: 'Verified',   joined: '3 May 2025'  },
  { initials: 'OT', name: 'O. Thabo',    email: 'othabo@gmail.com',      properties: 1, invested: 100_000, status: 'Active',  kyc: 'Verified',   joined: '10 May 2025' },
  { initials: 'RD', name: 'R. Dlamini',  email: 'rdlamini@gmail.com',    properties: 0, invested: 0,       status: 'Pending', kyc: 'Under review', joined: '1 Jun 2025'  },
  { initials: 'PS', name: 'P. Sithole',  email: 'psithole@gmail.com',    properties: 0, invested: 75_000,  status: 'Pending', kyc: 'Verified',   joined: '28 May 2025' },
  { initials: 'NM', name: 'N. Mokoena', email: 'nmokoena@gmail.com',    properties: 1, invested: 120_000, status: 'Active',  kyc: 'Verified',   joined: '15 May 2025' },
];

function fmt(n: number) { return n > 0 ? 'R' + n.toLocaleString('en-ZA') : '—'; }

function kycCls(kyc: string, styles: Record<string, string>) {
  if (kyc === 'Verified')     return styles.kycVerified;
  if (kyc === 'Under review') return styles.kycPending;
  return styles.kycFailed;
}

function statusCls(status: string, styles: Record<string, string>) {
  return status === 'Active' ? styles.pillActive : styles.pillPending;
}

const AVATAR_COLORS = ['av0','av1','av2','av3','av4','av5','av6','av0','av1','av2','av3','av4','av5','av6'];

export default function InvestorsPage() {
  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Investors</h1>
          <p className={s.pageSub}>Manage KYC verification, pledges and investor accounts</p>
        </div>
        <button className={s.btnPrimary}>＋ Invite investor</button>
      </div>

      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={`${s.statValue} ${st.accent ? s.accent : ''}`}>{st.value}</div>
          </div>
        ))}
      </div>

      <div className={s.toolbar}>
        <div className={s.filterGroup}>
          {['All', 'Active', 'Pending', 'Verified'].map((f) => (
            <button key={f} className={`${s.filterBtn} ${f === 'All' ? s.filterActive : ''}`}>{f}</button>
          ))}
        </div>
        <div className={s.search}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.searchInput} placeholder="Search investors…" readOnly />
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
            {INVESTORS.map((inv, i) => (
              <tr key={inv.email} className={s.tr}>
                <td className={s.td}>
                  <div className={s.invCell}>
                    <div className={`${s.avatar} ${s[AVATAR_COLORS[i % AVATAR_COLORS.length]]}`}>{inv.initials}</div>
                    <div>
                      <div className={s.invName}>{inv.name}</div>
                      <div className={s.invEmail}>{inv.email}</div>
                    </div>
                  </div>
                </td>
                <td className={s.td}><span className={statusCls(inv.status, s)}>{inv.status}</span></td>
                <td className={s.td}><span className={kycCls(inv.kyc, s)}>{inv.kyc}</span></td>
                <td className={s.td}><span className={s.muted}>{inv.properties}</span></td>
                <td className={s.td}><span className={s.money}>{fmt(inv.invested)}</span></td>
                <td className={s.td}><span className={s.muted}>{inv.joined}</span></td>
                <td className={s.td}>
                  <div className={s.rowActions}>
                    <button className={s.btnSm}>View</button>
                    {inv.status === 'Pending' && <button className={s.btnSmAccent}>Verify</button>}
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
