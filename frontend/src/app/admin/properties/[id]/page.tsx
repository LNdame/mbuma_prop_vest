import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import s from './page.module.css';
import PropertyCarousel, { type CarouselImage } from '@/components/PropertyCarousel';

/* ── Types ──────────────────────────────────────────────────────── */
interface Pledge {
  id: string;
  amount: string;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string; kycStatus: string };
}

interface PropertyDetail {
  id: string;
  title: string;
  propertyType: 'residential' | 'commercial' | 'mixed_use';
  address: string;
  province: string;
  status: 'draft' | 'open' | 'funded' | 'closed';
  purchasePrice: string;
  targetRaise: string;
  minimumPledge: string;
  fundedAmount: string;
  grossMonthlyRent: string;
  operatingExpensesMonthly: string;
  netMonthlyRent: string;
  projectedYieldPct: string;
  loanAmount: string | null;
  loanInterestRate: string | null;
  loanTermMonths: number | null;
  fundingCloseDate: string | null;
  createdAt: string;
  pledges: Pledge[];
}

/* ── Helpers ────────────────────────────────────────────────────── */
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtRand(n: string | number | null) {
  const v = Number(n);
  if (!v) return '—';
  return 'R' + v.toLocaleString('en-ZA');
}
function pct(funded: string, target: string) {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(funded) / t) * 100));
}
function propertyIcon(type: string) {
  if (type === 'commercial') return '🏢';
  if (type === 'mixed_use')  return '🏗';
  return '🏘';
}
function typeLabel(type: string) {
  if (type === 'mixed_use') return 'Mixed use';
  return type.charAt(0).toUpperCase() + type.slice(1);
}
function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ── Page ───────────────────────────────────────────────────────── */
export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: PropertyDetail;
  try {
    const res = await apiFetch<{ data: PropertyDetail }>(`/api/properties/${id}`);
    property = res.data;
  } catch {
    notFound();
  }

  // Property images (signed URLs re-issued by the backend on each read)
  let images: CarouselImage[] = [];
  try {
    const imgRes = await apiFetch<{ data: CarouselImage[] }>(`/api/properties/${id}/images`);
    images = imgRes.data;
  } catch {
    images = [];
  }

  const fundedPct      = pct(property.fundedAmount, property.targetRaise);
  const confirmedTotal = property.pledges
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const statusCls = property.status === 'open'   ? s.pillOpen
                  : property.status === 'funded' ? s.pillFunded
                  : property.status === 'closed' ? s.pillClosed
                  : s.pillDraft;

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.pageHeader}>
        <Link href="/admin/properties" className={s.backLink}>← Properties</Link>
        <div className={s.headerActions}>
          <Link href={`/admin/properties/${id}/edit`} className={s.btnSecondary}>Edit property</Link>
        </div>
      </div>

      {/* Image carousel */}
      <PropertyCarousel images={images} />

      {/* Hero card */}
      <div className={s.heroCard}>
        <div className={s.heroLeft}>
          <div className={s.propIcon}>{propertyIcon(property.propertyType)}</div>
          <div>
            <h1 className={s.propTitle}>{property.title}</h1>
            <div className={s.propMeta}>
              <span>{property.address}, {property.province}</span>
              <span>· {typeLabel(property.propertyType)}</span>
              <span>· Listed {fmtDate(property.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className={s.heroRight}>
          <span className={statusCls}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
          {property.fundingCloseDate && (
            <span className={s.closeDate}>Closes {fmtDate(property.fundingCloseDate)}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <div className={s.statLabel}>Raised</div>
          <div className={`${s.statValue} ${s.accent}`}>{fmtRand(property.fundedAmount)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Target</div>
          <div className={s.statValue}>{fmtRand(property.targetRaise)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Funded</div>
          <div className={s.statValue}>{fundedPct}%</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Projected yield</div>
          <div className={s.statValue}>{Number(property.projectedYieldPct).toFixed(1)}%</div>
        </div>
      </div>

      {/* Body grid */}
      <div className={s.bodyGrid}>

        {/* Left column */}
        <div className={s.leftCol}>

          {/* Funding progress */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Funding progress</span></div>
            <div className={s.fundingBody}>
              <div className={s.progRow}>
                <div className={s.progTrack}>
                  <div className={s.progFill} style={{ width: `${fundedPct}%` }} />
                </div>
                <span className={s.progPct}>{fundedPct}%</span>
              </div>
              <div className={s.fundingMeta}>
                <div className={s.fundMetaItem}>
                  <span className={s.fundMetaLabel}>Confirmed raised</span>
                  <span className={s.fundMetaValue}>{fmtRand(confirmedTotal)}</span>
                </div>
                <div className={s.fundMetaItem}>
                  <span className={s.fundMetaLabel}>Target raise</span>
                  <span className={s.fundMetaValue}>{fmtRand(property.targetRaise)}</span>
                </div>
                <div className={s.fundMetaItem}>
                  <span className={s.fundMetaLabel}>Min. pledge</span>
                  <span className={s.fundMetaValue}>{fmtRand(property.minimumPledge)}</span>
                </div>
                <div className={s.fundMetaItem}>
                  <span className={s.fundMetaLabel}>Investors</span>
                  <span className={s.fundMetaValue}>{property.pledges.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investor pledges */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Investors</span>
              <span className={s.badgeCount}>{property.pledges.length}</span>
            </div>
            {property.pledges.length === 0 ? (
              <div className={s.empty}>No investors yet</div>
            ) : property.pledges.map(pl => (
              <div key={pl.id} className={s.pledgeRow}>
                <div className={s.pledgeLeft}>
                  <div className={s.avatar}>{initials(pl.user.fullName)}</div>
                  <div>
                    <Link href={`/admin/investors/${pl.user.id}`} className={s.pledgeName}>
                      {pl.user.fullName}
                    </Link>
                    <div className={s.pledgeEmail}>{pl.user.email}</div>
                  </div>
                </div>
                <div className={s.pledgeRight}>
                  <span className={s.pledgeAmount}>{fmtRand(pl.amount)}</span>
                  <span className={pl.status === 'confirmed' ? s.pillConfirmed : s.pillPending}>
                    {pl.status}
                  </span>
                  <span className={s.pledgeDate}>{fmtDate(pl.confirmedAt ?? pl.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right column */}
        <div className={s.rightCol}>

          {/* Property details */}
          <div className={s.panel}>
            <div className={s.panelHead}><span className={s.panelTitle}>Property details</span></div>
            <div className={s.detailGrid}>
              {[
                { label: 'Purchase price',     value: fmtRand(property.purchasePrice) },
                { label: 'Property type',      value: typeLabel(property.propertyType) },
                { label: 'Province',           value: property.province },
                { label: 'Gross monthly rent', value: fmtRand(property.grossMonthlyRent) },
                { label: 'Operating expenses', value: fmtRand(property.operatingExpensesMonthly) },
                { label: 'Net monthly rent',   value: fmtRand(property.netMonthlyRent) },
              ].map(f => (
                <div key={f.label} className={s.detailField}>
                  <div className={s.fieldLabel}>{f.label}</div>
                  <div className={s.fieldValue}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan details */}
          {property.loanAmount && (
            <div className={s.panel}>
              <div className={s.panelHead}><span className={s.panelTitle}>Loan details</span></div>
              <div className={s.detailGrid}>
                {[
                  { label: 'Loan amount',    value: fmtRand(property.loanAmount) },
                  { label: 'Interest rate',  value: property.loanInterestRate ? `${Number(property.loanInterestRate).toFixed(1)}%` : '—' },
                  { label: 'Term',           value: property.loanTermMonths ? `${property.loanTermMonths} months` : '—' },
                ].map(f => (
                  <div key={f.label} className={s.detailField}>
                    <div className={s.fieldLabel}>{f.label}</div>
                    <div className={s.fieldValue}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
