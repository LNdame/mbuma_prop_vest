import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicFetch } from '@/lib/api';
import s from '../properties.module.css';
import PropertyCarousel, { type CarouselImage } from '@/components/PropertyCarousel';

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
function typeLabel(t: string) {
  if (t === 'mixed_use') return 'Mixed use';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default async function PublicPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: PropertyDetail;
  try {
    const res = await publicFetch<{ data: PropertyDetail }>(`/api/properties/${id}`);
    property = res.data;
  } catch {
    notFound();
  }

  // Don't expose drafts publicly
  if (property.status === 'draft') notFound();

  let images: CarouselImage[] = [];
  try {
    const imgRes = await publicFetch<{ data: CarouselImage[] }>(`/api/properties/${id}/images`);
    images = imgRes.data;
  } catch {
    images = [];
  }

  const fundedPct = pct(property.fundedAmount, property.targetRaise);
  const isOpen    = property.status === 'open';

  const statusCls = property.status === 'open'   ? s.pillOpen
                  : property.status === 'funded' ? s.pillFunded
                  : s.pillClosed;

  return (
    <div className={s.detail}>
      <Link href="/properties" className={s.backLink}>← Back to properties</Link>

      <PropertyCarousel images={images} />

      <div className={s.detailHero}>
        <div>
          <span className={s.detailType}>{typeLabel(property.propertyType)}</span>
          <h1 className={s.detailTitle}>{property.title}</h1>
          <span className={s.detailAddr}>📍 {property.address}, {property.province}</span>
        </div>
        <div className={s.detailStatus}>
          <span className={statusCls}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
          {property.fundingCloseDate && (
            <span className={s.closeDate}>Closes {fmtDate(property.fundingCloseDate)}</span>
          )}
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <div className={s.statLabel}>Min. pledge</div>
          <div className={s.statValue}>{fmtRand(property.minimumPledge)}</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statLabel}>Projected yield</div>
          <div className={`${s.statValue} ${s.statAccent}`}>{Number(property.projectedYieldPct).toFixed(1)}%</div>
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

      <div className={s.bodyGrid}>
        <div className={s.leftCol}>

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
              ].map((f) => (
                <div key={f.label} className={s.detailField}>
                  <div className={s.fieldLabel}>{f.label}</div>
                  <div className={s.fieldValue}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className={s.rightCol}>
          <div className={s.ctaCard}>
            <div className={s.ctaTitle}>Invest in this property</div>
            <div className={s.ctaSub}>
              Mbuma PropVest is invite-only. Log in or request an invitation to pledge your share
              and earn a projected {Number(property.projectedYieldPct).toFixed(1)}% yield.
            </div>
            <div className={s.ctaRow}>
              <span className={s.ctaLabel}>Minimum pledge</span>
              <span className={s.ctaValue}>{fmtRand(property.minimumPledge)}</span>
            </div>
            <div className={s.ctaRow}>
              <span className={s.ctaLabel}>Projected yield</span>
              <span className={s.ctaValue}>{Number(property.projectedYieldPct).toFixed(1)}%</span>
            </div>
            <Link href="/login" className={s.btnCta}>
              {isOpen ? 'Log in to pledge →' : 'Log in to view'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
