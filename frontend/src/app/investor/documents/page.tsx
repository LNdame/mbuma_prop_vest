import s from '../investor.module.css';

const DOCS = [
  { icon: '📄', name: 'Investment Agreement — Fern Close',   type: 'Investment Agreement', property: '14 Fern Close',    date: '12 Jan 2025', signing: 'Signed',   cta: 'Download' },
  { icon: '📄', name: 'Investment Agreement — Sandton Gdns', type: 'Investment Agreement', property: 'Sandton Gardens',  date: '3 Mar 2024',  signing: 'Signed',   cta: 'Download' },
  { icon: '📄', name: 'Investment Agreement — Kyalami',      type: 'Investment Agreement', property: 'Kyalami Corner',   date: '28 May 2025', signing: 'Signed',   cta: 'Download' },
  { icon: '🪪', name: 'ID Document — S. Khumalo',            type: 'ID Document',          property: '—',               date: '5 Jan 2025',  signing: '—',        cta: 'View'     },
  { icon: '📋', name: 'Proof of Address',                    type: 'Proof of Address',     property: '—',               date: '5 Jan 2025',  signing: '—',        cta: 'View'     },
  { icon: '📊', name: 'Tax Certificate IT3(b) — 2024',       type: 'Tax Certificate',      property: 'All properties',   date: '28 Feb 2025', signing: '—',        cta: 'Download' },
];

function signingPill(status: string, s: Record<string,string>) {
  if (status === 'Signed')  return s.pillConfirmed;
  if (status === 'Pending') return s.pillPending;
  return '';
}

export default function InvestorDocuments() {
  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Documents</h1>
          <p className={s.pageSub}>Your investment agreements, KYC documents, and tax certificates</p>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>All Documents</span>
          <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{DOCS.length} files</span>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 0.8fr 0.7fr',
          padding: '8px 18px',
          background: 'var(--neutral-50)',
          borderBottom: '1px solid var(--neutral-100)',
          gap: 8,
        }}>
          {['Document','Type','Property','Date','Status',''].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</span>
          ))}
        </div>

        {DOCS.map((d) => (
          <div key={d.name} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 0.8fr 0.7fr',
            padding: '13px 18px',
            borderBottom: '1px solid var(--neutral-100)',
            gap: 8,
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{d.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{d.type}</span>
            <span style={{ fontSize: 12, color: 'var(--neutral-600, #4a5a52)' }}>{d.property}</span>
            <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{d.date}</span>
            <span>
              {d.signing !== '—' ? (
                <span className={signingPill(d.signing, s as Record<string,string>)}>{d.signing}</span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>—</span>
              )}
            </span>
            <button className={s.btnSm}>{d.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
