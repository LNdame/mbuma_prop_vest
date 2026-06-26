'use client';

import s from '../investor.module.css';
import { useMe, type MeDocument } from '../../../lib/useMe';

function docMeta(t: MeDocument['docType']) {
  switch (t) {
    case 'id_document':         return { icon: '🪪', label: 'ID Document' };
    case 'selfie_with_id':      return { icon: '🤳', label: 'Selfie with ID' };
    case 'proof_of_address':    return { icon: '📋', label: 'Proof of Residence' };
    case 'investment_agreement':return { icon: '📄', label: 'Pledge Agreement' };
    case 'title_deed':          return { icon: '📜', label: 'Title Deed' };
    default:                    return { icon: '📁', label: 'Other' };
  }
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function signingPill(st: string, cls: Record<string, string>) {
  if (st === 'signed')   return cls.pillConfirmed;
  if (st === 'declined') return cls.pillClosed;
  return cls.pillPending; // pending / sent
}
function signingLabel(st: string) {
  return st.charAt(0).toUpperCase() + st.slice(1);
}

export default function InvestorDocuments() {
  const { me, loading, error } = useMe();

  if (loading) return <div className={s.page}><div className={s.emptyState}>Loading documents…</div></div>;
  if (error === 'unauthenticated') return <div className={s.page}><div className={s.emptyState}>Please <a href="/login" className={s.panelLink}>log in</a> to view documents.</div></div>;
  if (error || !me) return <div className={s.page}><div className={s.emptyState}>Couldn’t load documents. {error}</div></div>;

  const docs = me.documents;
  const cols = '2fr 1.2fr 1.2fr 1fr 0.8fr 0.7fr';

  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Documents</h1>
          <p className={s.pageSub}>Your pledge agreements, KYC documents, and tax certificates</p>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>All Documents</span>
          <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{docs.length} {docs.length === 1 ? 'file' : 'files'}</span>
        </div>

        {docs.length === 0 ? (
          <div className={s.emptyState}>No documents yet. Agreements and certificates will appear here.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '8px 18px', background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-100)', gap: 8 }}>
              {['Document', 'Type', 'Property', 'Date', 'Status', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</span>
              ))}
            </div>

            {docs.map((d) => {
              const meta = docMeta(d.docType);
              const signable = d.docType === 'investment_agreement';
              return (
                <div key={d.id} style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 18px', borderBottom: '1px solid var(--neutral-100)', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{meta.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--neutral-600, #4a5a52)' }}>{d.property?.title ?? '—'}</span>
                  <span style={{ fontSize: 12, color: 'var(--neutral-500)' }}>{fmtDate(d.createdAt)}</span>
                  <span>
                    {signable ? (
                      <span className={signingPill(d.signingStatus, s as Record<string, string>)}>{signingLabel(d.signingStatus)}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--neutral-400)' }}>—</span>
                    )}
                  </span>
                  <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <button className={s.btnSm}>{signable ? 'View' : 'Download'}</button>
                  </a>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
