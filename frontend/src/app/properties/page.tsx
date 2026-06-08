import Link from 'next/link';
import { publicFetch } from '@/lib/api';
import s from './properties.module.css';

export const metadata = {
  title: 'Browse Properties · Mbuma PropVest',
  description: 'Browse curated, yield-producing South African property investment opportunities.',
};

interface PropertyListItem {
  id: string;
  title: string;
  propertyType: 'residential' | 'commercial' | 'mixed_use';
  address: string;
  province: string;
  status: 'draft' | 'open' | 'funded' | 'closed';
  targetRaise: string;
  minimumPledge: string;
  fundedAmount: string;
  projectedYieldPct: string;
  investorCount: number;
  coverImageUrl: string | null;
}

function fmtRand(n: string | number | null) {
  const v = Number(n);
  if (!v) return 'R0';
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
function propertyEmoji(t: string) {
  if (t === 'commercial') return '🏢';
  if (t === 'mixed_use')  return '🏗️';
  return '🏘️';
}

export default async function BrowsePropertiesPage() {
  let properties: PropertyListItem[] = [];
  try {
    const res = await publicFetch<{ data: PropertyListItem[] }>('/api/properties');
    properties = res.data;
  } catch {
    properties = [];
  }

  // Public listing: hide drafts
  const listed = properties.filter((p) => p.status !== 'draft');

  return (
    <div className={s.browse}>
      <div className={s.browseHead}>
        <span className={s.eyebrow}>Investment Opportunities</span>
        <h1 className={s.title}>Browse Properties</h1>
        <p className={s.subtitle}>
          Curated, yield-producing South African real estate. Co-own institutional-grade
          property from as little as R1 000 and earn monthly distributions.
        </p>
        <div className={s.filterBar}>
          <span className={s.filterPill}>All types</span>
          <span className={s.filterPill}>All provinces</span>
          <span className={s.filterPill}>Open</span>
          <span className={s.filterCount}>
            {listed.length} {listed.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
      </div>

      {listed.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🏘️</div>
          <p>No properties are listed yet. Check back soon.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {listed.map((p) => {
            const funded = pct(p.fundedAmount, p.targetRaise);
            const badgeCls = p.status === 'funded' ? s.badgeFunded
                           : p.status === 'closed' ? s.badgeClosed
                           : s.badgeOpen;
            return (
              <Link key={p.id} href={`/properties/${p.id}`} className={s.card}>
                <div className={s.cardImg}>
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImageUrl} alt={p.title} />
                  ) : (
                    <span className={s.cardImgPlaceholder}>{propertyEmoji(p.propertyType)}</span>
                  )}
                  <span className={[s.badge, badgeCls].join(' ')}>{p.status}</span>
                  <div className={s.progressWrap}>
                    <div className={s.progressBar} style={{ width: `${funded}%` }} />
                  </div>
                </div>

                <div className={s.cardBody}>
                  <div className={s.cardType}>{typeLabel(p.propertyType)}</div>
                  <div className={s.cardTitle}>{p.title}</div>
                  <div className={s.cardAddr}>📍 {p.address}, {p.province}</div>

                  <div className={s.metrics}>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{fmtRand(p.minimumPledge)}</div>
                      <div className={s.metricLabel}>Min. pledge</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{Number(p.projectedYieldPct).toFixed(1)}%</div>
                      <div className={s.metricLabel}>Proj. yield</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{fmtRand(p.targetRaise)}</div>
                      <div className={s.metricLabel}>Total raise</div>
                    </div>
                  </div>

                  <div className={s.fundingRow}>
                    <span>{funded}% funded</span>
                    <strong>{fmtRand(p.fundedAmount)} raised</strong>
                  </div>
                  <div className={s.fundingTrack}>
                    <div className={s.fundingFill} style={{ width: `${funded}%` }} />
                  </div>

                  <div className={s.cardCta}>View details →</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
