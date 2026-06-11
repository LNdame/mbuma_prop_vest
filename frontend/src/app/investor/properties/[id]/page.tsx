import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import s from './page.module.css';
import PropertyCarousel, { type CarouselImage } from '@/components/PropertyCarousel';
import PledgePanel from './PledgePanel';

/* ── Types ──────────────────────────────────────────────────────── */
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
  fundingCloseDate: string | null;
  createdAt: string;
  pledges: { id: string }[];
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
function typeLabel(type: string) {
  if (type === 'mixed_use') return 'Mixed use';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/* ── Page ───────────────────────────────────────────────────────── */
export default async function InvestorPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const fundedPct = pct(property.fundedAmount, property.targetRaise);

  const statusCls = property.status === 'open'   ? s.pillOpen
                  : property.status === 'funded' ? s.pillFunded
                  : property.status === 'closed' ? s.pillClosed
                  : s.pillDraft;

  return (
    <div className={s.page}>

      <Link href="/investor/properties" className={s.backLink}>← Back to properties</Link>

      {/* Image carousel */}
      <PropertyCarousel images={images} />

      {/* Hero */}
      <div className={s.heroCard}>
        <div className={s.heroLeft}>
          <span className={s.propType}>{typeLabel(property.propertyType)}</span>
          <h1 className={s.propTitle}>{property.title}</h1>
          <span className={s.propAddr}>📍 {property.address}, {property.province}</span>
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
          <div className={s.statLabel}>Min. pledge</div>
          <div className={s.statValue}>{fmtRand(property.minimumPledge)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Projected yield</div>
          <div className={`${s.statValue} ${s.accent}`}>{Number(property.projectedYieldPct).toFixed(1)}%</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Target raise</div>
          <div className={s.statValue}>{fmtRand(property.targetRaise)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Funded</div>
          <div className={s.statValue}>{fundedPct}%</div>
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
                  <span className={s.fundMetaLabel}>Raised so far</span>
                  <span className={s.fundMetaValue}>{fmtRand(property.fundedAmount)}</span>
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

        </div>

        {/* Right column — pledge CTA */}
        <div className={s.rightCol}>
          <PledgePanel
            propertyId={property.id}
            status={property.status}
            minimumPledge={property.minimumPledge}
            projectedYieldPct={property.projectedYieldPct}
            targetRaise={property.targetRaise}
            fundedAmount={property.fundedAmount}
          />
        </div>

      </div>
    </div>
  );
}
