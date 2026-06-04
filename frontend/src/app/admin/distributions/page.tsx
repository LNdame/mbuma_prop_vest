import s from './page.module.css';

const STATS = [
  { label: 'Distributed YTD',   value: 'R236,000', accent: true  },
  { label: 'Last distribution', value: 'R47,200',  accent: false },
  { label: 'Next distribution', value: '1 Jul',    accent: false },
  { label: 'Recipients',        value: '8',        accent: false },
];

const HISTORY = [
  { id: 'D006', date: '1 Jun 2025', amount: 47_200, recipients: 8, status: 'Sent',     properties: 'All' },
  { id: 'D005', date: '1 May 2025', amount: 44_800, recipients: 8, status: 'Sent',     properties: 'All' },
  { id: 'D004', date: '1 Apr 2025', amount: 44_800, recipients: 7, status: 'Sent',     properties: 'All' },
  { id: 'D003', date: '1 Mar 2025', amount: 41_600, recipients: 6, status: 'Sent',     properties: 'All' },
  { id: 'D002', date: '1 Feb 2025', amount: 38_400, recipients: 5, status: 'Sent',     properties: 'All' },
  { id: 'D001', date: '1 Jan 2025', amount: 19_200, recipients: 3, status: 'Sent',     properties: 'Fern Close' },
];

const NEXT_BREAKDOWN = [
  { initials: 'SK', name: 'S. Khumalo',   properties: '14 Fern Close + Unit 7',  share: 8_400,  bankStatus: 'On file' },
  { initials: 'PN', name: 'P. Nkosi',     properties: '14 Fern Close',            share: 3_600,  bankStatus: 'On file' },
  { initials: 'AM', name: 'A. Molefe',    properties: '14 Fern Close + Unit 7',  share: 7_200,  bankStatus: 'On file' },
  { initials: 'TM', name: 'T. Mahlangu', properties: 'Unit 7, Sandton Gardens',  share: 4_800,  bankStatus: 'On file' },
  { initials: 'NZ', name: 'N. Zulu',     properties: 'Unit 7, Sandton Gardens',  share: 10_080, bankStatus: 'On file' },
  { initials: 'LM', name: 'L. Mokoena', properties: 'Unit 7, Sandton Gardens',  share: 2_400,  bankStatus: 'On file' },
  { initials: 'BN', name: 'B. Ndlovu',  properties: 'Unit 7, Sandton Gardens',  share: 1_800,  bankStatus: 'On file' },
  { initials: 'NM', name: 'N. Mokoena', properties: 'Unit 7, Sandton Gardens',  share: 2_880,  bankStatus: 'Missing' },
];

function fmt(n: number) { return 'R' + n.toLocaleString('en-ZA'); }

const AVATAR_COLORS = ['av0','av1','av2','av3','av4','av5','av6','av0'];

export default function DistributionsPage() {
  const nextTotal = NEXT_BREAKDOWN.reduce((a, b) => a + b.share, 0);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Distributions</h1>
          <p className={s.pageSub}>Manage and track monthly distributions to investors</p>
        </div>
        <button className={s.btnPrimary}>Run distribution →</button>
      </div>

      <div className={s.statsRow}>
        {STATS.map((st) => (
          <div key={st.label} className={s.statCard}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={`${s.statValue} ${st.accent ? s.accent : ''}`}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Next distribution preview */}
      <div className={s.nextPanel}>
        <div className={s.nextPanelHead}>
          <div>
            <div className={s.nextTitle}>Upcoming distribution — 1 Jul 2025</div>
            <div className={s.nextSub}>Review breakdown before running. 1 investor has missing bank details.</div>
          </div>
          <div className={s.nextTotal}>
            <span className={s.nextTotalLabel}>Total</span>
            <span className={s.nextTotalValue}>{fmt(nextTotal)}</span>
          </div>
        </div>

        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.th}>Investor</th>
              <th className={s.th}>Properties</th>
              <th className={s.th}>Amount</th>
              <th className={s.th}>Bank details</th>
            </tr>
          </thead>
          <tbody>
            {NEXT_BREAKDOWN.map((r, i) => (
              <tr key={r.name} className={s.tr}>
                <td className={s.td}>
                  <div className={s.invCell}>
                    <div className={`${s.avatar} ${s[AVATAR_COLORS[i]]}`}>{r.initials}</div>
                    <span className={s.invName}>{r.name}</span>
                  </div>
                </td>
                <td className={s.td}><span className={s.muted}>{r.properties}</span></td>
                <td className={s.td}><span className={s.money}>{fmt(r.share)}</span></td>
                <td className={s.td}>
                  {r.bankStatus === 'On file'
                    ? <span className={s.bankOk}>✓ On file</span>
                    : <span className={s.bankMissing}>⚠ Missing — <a href="/admin/investors" className={s.chaseLink}>chase</a></span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.nextPanelFoot}>
          <span className={s.footNote}>1 investor excluded pending bank details</span>
          <button className={s.btnPrimary}>Run distribution →</button>
        </div>
      </div>

      {/* History */}
      <div className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionTitle}>Distribution history</span>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>Run ID</th>
                <th className={s.th}>Date</th>
                <th className={s.th}>Amount</th>
                <th className={s.th}>Recipients</th>
                <th className={s.th}>Properties</th>
                <th className={s.th}>Status</th>
                <th className={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h) => (
                <tr key={h.id} className={s.tr}>
                  <td className={s.td}><span className={s.runId}>{h.id}</span></td>
                  <td className={s.td}><span className={s.muted}>{h.date}</span></td>
                  <td className={s.td}><span className={s.money}>{fmt(h.amount)}</span></td>
                  <td className={s.td}><span className={s.muted}>{h.recipients} investors</span></td>
                  <td className={s.td}><span className={s.muted}>{h.properties}</span></td>
                  <td className={s.td}><span className={s.pillSent}>{h.status}</span></td>
                  <td className={s.td}><button className={s.btnSm}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
