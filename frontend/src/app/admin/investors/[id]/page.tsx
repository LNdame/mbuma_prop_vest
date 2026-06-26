import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import s from './page.module.css';
import AllocateFundsForm from '@/components/AllocateFundsForm';
import CancelPledgeButton from '@/components/CancelPledgeButton';
import ConfirmPledgeButton from '@/components/ConfirmPledgeButton';
import VerifyInvestorButton from '@/components/VerifyInvestorButton';

/* ── Types ──────────────────────────────────────────────────────── */
interface Pledge {
  id: string;
  amount: string;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    propertyType: string;
    status: string;
    projectedYieldPct: string;
  };
}

interface DistributionLine {
  id: string;
  netAmount: string;
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
  distribution: { periodLabel: string; processedAt: string | null };
}

interface InvestorProfile {
  bankName: string | null;
  bankAccountNumber: string | null;
  idType: string | null;
  addressLine1: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
}

interface InvestorDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  kycStatus: string;
  kycVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  investorProfile: InvestorProfile | null;
  pledges: Pledge[];
  distributionLines: DistributionLine[];
  availableFunds: number;
  fundsBreakdown: { deposits: number; distributions: number; reserved: number };
  fundAllocations: FundAllocation[];
  kycDocuments: KycDoc[];
}

interface FundAllocation {
  id: string;
  amount: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
}

interface KycDoc {
  id: string;
  docType: 'id_document' | 'selfie_with_id' | 'proof_of_address' | string;
  fileName: string;
  mimeType: string;
  createdAt: string;
  downloadUrl: string;
}

/* ── Helpers ────────────────────────────────────────────────────── */
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtRand(n: string | number) {
  const v = Number(n);
  if (!v) return '—';
  return 'R' + v.toLocaleString('en-ZA');
}
function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
function propertyIcon(type: string) {
  if (type === 'commercial') return '🏢';
  if (type === 'mixed_use')  return '🏗';
  return '🏘';
}
function kycLabel(status: string) {
  if (status === 'approved') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  if (status === 'under_review') return 'Under review';
  return 'Pending';
}
function kycDocMeta(t: string) {
  if (t === 'id_document')      return { icon: '🪪', label: 'ID Document' };
  if (t === 'selfie_with_id')   return { icon: '🤳', label: 'Selfie with ID' };
  if (t === 'proof_of_address') return { icon: '📋', label: 'Proof of Residence' };
  return { icon: '📄', label: t };
}

/* ── Page (Server Component) ────────────────────────────────────── */
export default async function InvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let investor: InvestorDetail;
  try {
    const res = await apiFetch<{ data: InvestorDetail }>(`/api/investors/${id}`);
    investor = res.data;
  } catch {
    notFound();
  }

  const totalInvested = investor.pledges
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalReceived = investor.distributionLines
    .filter((d) => d.paymentStatus === 'paid')
    .reduce((sum, d) => sum + Number(d.netAmount), 0);

  const kycCls = investor.kycStatus === 'approved' ? s.kycVerified
               : investor.kycStatus === 'rejected'  ? s.kycRejected
               : s.kycPending;

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.pageHeader}>
        <a href="/admin/investors" className={s.backLink}>← Investors</a>
        <div className={s.headerActions}>
          {(investor.kycStatus === 'pending' || investor.kycStatus === 'under_review') && (
            <VerifyInvestorButton investorId={investor.id} className={s.btnVerify} />
          )}
          <button className={s.btnSecondary}>Send message</button>
        </div>
      </div>

      {/* Profile hero */}
      <div className={s.heroCard}>
        <div className={s.heroLeft}>
          <div className={s.avatar}>{initials(investor.fullName)}</div>
          <div>
            <h1 className={s.investorName}>{investor.fullName}</h1>
            <div className={s.investorMeta}>
              <span>{investor.email}</span>
              {investor.phone && <span>· {investor.phone}</span>}
              <span>· Joined {fmtDate(investor.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className={s.heroRight}>
          <span className={kycCls}>{kycLabel(investor.kycStatus)}</span>
          {investor.kycVerifiedAt && (
            <span className={s.kycDate}>Verified {fmtDate(investor.kycVerifiedAt)}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <div className={s.statLabel}>Available funds</div>
          <div className={`${s.statValue} ${s.accent}`}>{fmtRand(investor.availableFunds) || 'R0'}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Total invested</div>
          <div className={s.statValue}>{fmtRand(totalInvested)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Total received</div>
          <div className={s.statValue}>{fmtRand(totalReceived) || 'R0'}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Active pledges</div>
          <div className={s.statValue}>{investor.pledges.filter((p) => p.status === 'confirmed').length}</div>
        </div>
      </div>

      <div className={s.bodyGrid}>

        {/* Left column */}
        <div className={s.leftCol}>

          {/* KYC documents */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>KYC documents</span>
              {investor.kycStatus === 'under_review' && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eef4ff', padding: '3px 9px', borderRadius: 99 }}>Awaiting review</span>
              )}
            </div>
            {investor.kycDocuments.length === 0 ? (
              <div className={s.empty}>No KYC documents uploaded yet</div>
            ) : investor.kycDocuments.map((d) => {
              const meta = kycDocMeta(d.docType);
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 22 }}>{meta.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-900)' }}>{meta.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName} · {fmtDate(d.createdAt)}</div>
                    </div>
                  </div>
                  <a href={d.downloadUrl} target="_blank" rel="noreferrer"><button className={s.btnSecondary}>View</button></a>
                </div>
              );
            })}
          </div>

          {/* Pledges */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Pledges</span></div>
            {investor.pledges.length === 0 ? (
              <div className={s.empty}>No pledges yet</div>
            ) : investor.pledges.map((pl) => (
              <div key={pl.id} className={s.pledgeRow}>
                <div className={s.pledgeLeft}>
                  <span className={s.pledgeIcon}>{propertyIcon(pl.property.propertyType)}</span>
                  <div>
                    <div className={s.pledgeName}>{pl.property.title}</div>
                    <div className={s.pledgeSub}>
                      {pl.property.propertyType.replace('_', ' ')} · {Number(pl.property.projectedYieldPct).toFixed(1)}% yield
                    </div>
                  </div>
                </div>
                <div className={s.pledgeRight}>
                  <span className={s.pledgeAmount}>{fmtRand(pl.amount)}</span>
                  <span className={pl.status === 'confirmed' ? s.pillConfirmed : s.pillPending}>
                    {pl.status}
                  </span>
                  <span className={s.pledgeDate}>{fmtDate(pl.confirmedAt ?? pl.createdAt)}</span>
                  {pl.status === 'pending' && (
                    <>
                      <ConfirmPledgeButton pledgeId={pl.id} />
                      <CancelPledgeButton
                        pledgeId={pl.id}
                        canCancel={pl.property.status === 'open'}
                        disabledReason="Property funding is closed — this pledge can no longer be cancelled."
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Distribution history */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Distribution history</span></div>
            {investor.distributionLines.length === 0 ? (
              <div className={s.empty}>No distributions yet</div>
            ) : investor.distributionLines.map((dl) => (
              <div key={dl.id} className={s.distRow}>
                <div>
                  <div className={s.distPeriod}>{dl.distribution.periodLabel}</div>
                  <div className={s.distDate}>{fmtDate(dl.paidAt ?? dl.createdAt)}</div>
                </div>
                <div className={s.distRight}>
                  <span className={s.distAmount}>{fmtRand(dl.netAmount)}</span>
                  <span className={dl.paymentStatus === 'paid' ? s.pillPaid : s.pillPending}>
                    {dl.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right column */}
        <div className={s.rightCol}>

          {/* Funds / wallet */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Available funds</span></div>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-600)', letterSpacing: '-0.5px' }}>
                {'R' + Math.round(investor.availableFunds).toLocaleString('en-ZA')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 2 }}>
                Spendable balance for new pledges
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--neutral-500)' }}>Bank deposits</span>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>+R{Math.round(investor.fundsBreakdown.deposits).toLocaleString('en-ZA')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--neutral-500)' }}>From distributions</span>
                  <span style={{ fontWeight: 600, color: 'var(--green-600)' }}>+R{Math.round(investor.fundsBreakdown.distributions).toLocaleString('en-ZA')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--neutral-500)' }}>Reserved in pledges</span>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>−R{Math.round(investor.fundsBreakdown.reserved).toLocaleString('en-ZA')}</span>
                </div>
              </div>
            </div>

            {/* Allocate funds */}
            <AllocateFundsForm investorId={investor.id} />

            {/* Allocation history */}
            {investor.fundAllocations.length > 0 && (
              <div style={{ borderTop: '1px solid var(--neutral-100)' }}>
                {investor.fundAllocations.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--neutral-100)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>{fmtRand(a.amount)}</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral-500)' }}>
                        {fmtDate(a.createdAt)}{a.reference ? ` · ${a.reference}` : ''}{a.note ? ` · ${a.note}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-700, #15803d)', background: 'var(--green-100)', padding: '3px 9px', borderRadius: 99 }}>Credited</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Profile details</span></div>
            <div className={s.profileGrid}>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>KYC status</div>
                <div className={s.fieldValue}><span className={kycCls}>{kycLabel(investor.kycStatus)}</span></div>
              </div>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>ID type</div>
                <div className={s.fieldValue}>{investor.investorProfile?.idType?.replace('_', ' ') ?? '—'}</div>
              </div>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>Bank</div>
                <div className={s.fieldValue}>{investor.investorProfile?.bankName ?? '—'}</div>
              </div>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>Account number</div>
                <div className={s.fieldValue}>{investor.investorProfile?.bankAccountNumber ?? '—'}</div>
              </div>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>Address</div>
                <div className={s.fieldValue}>
                  {investor.investorProfile?.addressLine1 ?? '—'}
                  {investor.investorProfile?.city ? `, ${investor.investorProfile.city}` : ''}
                  {investor.investorProfile?.province ? `, ${investor.investorProfile.province}` : ''}
                </div>
              </div>
              <div className={s.profileField}>
                <div className={s.fieldLabel}>Account status</div>
                <div className={s.fieldValue}>
                  <span className={investor.isActive ? s.pillConfirmed : s.pillPending}>
                    {investor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
