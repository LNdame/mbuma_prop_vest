import Link from 'next/link';
import { publicFetch } from '@/lib/api';
import Money from '@/components/Money';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import s from '../investor.module.css';

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
  coverImageUrl: string | null;
}

function fundedPct(funded: string, target: string) {
  const t = Number(target);
  if (!t) return 0;
  return Math.min(100, Math.round((Number(funded) / t) * 100));
}
function typeLabel(t: string) {
  if (t === 'mixed_use') return 'Mixed-use';
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function propertyEmoji(t: string) {
  if (t === 'commercial') return '🏢';
  if (t === 'mixed_use')  return '🏗️';
  return '🏘️';
}

export default async function InvestorProperties() {
  let properties: PropertyListItem[] = [];
  try {
    const res = await publicFetch<{ data: PropertyListItem[] }>('/api/properties');
    properties = res.data;
  } catch {
    properties = [];
  }
  const listed = properties.filter((p) => p.status !== 'draft');

  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Available Properties</h1>
          <p className={s.pageSub}>Browse curated opportunities and pledge your share</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className={s.pageSub}>{listed.length} {listed.length === 1 ? 'property' : 'properties'}</span>
          <CurrencySwitcher />
        </div>
      </div>

      {listed.length === 0 ? (
        <div className={s.emptyState}>No properties are listed yet. Check back soon.</div>
      ) : (
        <div className={s.fullGrid}>
          {listed.map((p) => {
            const funded = fundedPct(p.fundedAmount, p.targetRaise);
            const badgeCls = p.status === 'open' ? s.badgeOpen : s.badgeFunded;
            return (
              <Link key={p.id} href={`/investor/properties/${p.id}`} className={s.propCard} style={{ textDecoration: 'none' }}>
                <div className={s.propCardImg} style={{ position: 'relative', overflow: 'hidden' }}>
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImageUrl} alt={p.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    propertyEmoji(p.propertyType)
                  )}
                  <span className={[s.propCardBadge, badgeCls].join(' ')} style={{ textTransform: 'capitalize' }}>
                    {p.status}
                  </span>
                  <div className={s.propCardProgressWrap}>
                    <div className={s.propCardProgressFill} style={{ width: `${funded}%` }} />
                  </div>
                </div>

                <div className={s.propCardBody}>
                  <div className={s.propCardType}>{typeLabel(p.propertyType)}</div>
                  <div className={s.propCardTitle}>{p.title}</div>
                  <div className={s.propCardAddr}>📍 {p.address}, {p.province}</div>

                  <div className={s.propCardMetrics}>
                    <div className={s.metricCell}>
                      <div className={s.metricVal}><Money amount={p.minimumPledge} /></div>
                      <div className={s.metricLbl}>Min. Pledge</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricVal}>{Number(p.projectedYieldPct).toFixed(1)}%</div>
                      <div className={s.metricLbl}>Proj. Yield</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricVal}><Money amount={p.targetRaise} /></div>
                      <div className={s.metricLbl}>Total Raise</div>
                    </div>
                  </div>

                  <div className={s.fundingRow}>
                    <span>{funded}% funded</span>
                    <strong><Money amount={p.fundedAmount} /> raised</strong>
                  </div>
                  <div className={s.fundingBarTrack}>
                    <div className={s.fundingBarFill} style={{ width: `${funded}%` }} />
                  </div>

                  <span className={s.btnCardCta} style={{ display: 'block', textAlign: 'center' }}>
                    {funded >= 100 ? 'View Details' : 'View & Pledge →'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
