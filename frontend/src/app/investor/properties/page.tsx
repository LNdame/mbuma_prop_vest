import s from '../investor.module.css';

const PROPERTIES = [
  {
    id: '1', emoji: '🏘️', colorClass: '',
    badge: 'Open', badgeClass: 'badgeOpen',
    type: 'Residential', title: 'Sandown Residential Estate',
    address: 'Sandton, Gauteng',
    min: 'R1 000', yield: '9.2%', raise: 'R4.2M',
    funded: 68, fundedLabel: '68% funded', raisedLabel: 'R2.86M raised',
  },
  {
    id: '2', emoji: '🏢', colorClass: 'blue',
    badge: 'Open', badgeClass: 'badgeOpen',
    type: 'Commercial', title: 'Century City Office Park',
    address: 'Cape Town, Western Cape',
    min: 'R2 500', yield: '10.8%', raise: 'R8.5M',
    funded: 43, fundedLabel: '43% funded', raisedLabel: 'R3.66M raised',
  },
  {
    id: '3', emoji: '🏡', colorClass: 'amber',
    badge: 'Funded', badgeClass: 'badgeFunded',
    type: 'Residential', title: 'Umhlanga Ridge Apartments',
    address: 'Durban, KwaZulu-Natal',
    min: 'R1 500', yield: '8.7%', raise: 'R3.1M',
    funded: 100, fundedLabel: '100% funded', raisedLabel: 'R3.1M raised',
  },
  {
    id: '4', emoji: '🏘️', colorClass: '',
    badge: 'Open', badgeClass: 'badgeOpen',
    type: 'Mixed-use', title: 'Rosebank Junction',
    address: 'Rosebank, Gauteng',
    min: 'R5 000', yield: '11.2%', raise: 'R12.0M',
    funded: 22, fundedLabel: '22% funded', raisedLabel: 'R2.64M raised',
  },
  {
    id: '5', emoji: '🏢', colorClass: 'blue',
    badge: 'Open', badgeClass: 'badgeOpen',
    type: 'Commercial', title: 'Waterfall Business Park',
    address: 'Midrand, Gauteng',
    min: 'R3 000', yield: '10.1%', raise: 'R6.8M',
    funded: 55, fundedLabel: '55% funded', raisedLabel: 'R3.74M raised',
  },
  {
    id: '6', emoji: '🏡', colorClass: 'amber',
    badge: 'Funded', badgeClass: 'badgeFunded',
    type: 'Residential', title: 'Stellenbosch Vine Estate',
    address: 'Stellenbosch, Western Cape',
    min: 'R2 000', yield: '9.5%', raise: 'R5.2M',
    funded: 100, fundedLabel: '100% funded', raisedLabel: 'R5.2M raised',
  },
];

export default function InvestorProperties() {
  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Available Properties</h1>
          <p className={s.pageSub}>Browse curated investment opportunities and pledge your share</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--neutral-200)', background: 'var(--white)', color: 'var(--neutral-700)' }}>
            <option>All types</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Mixed-use</option>
          </select>
          <select style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--neutral-200)', background: 'var(--white)', color: 'var(--neutral-700)' }}>
            <option>All provinces</option>
            <option>Gauteng</option>
            <option>Western Cape</option>
            <option>KwaZulu-Natal</option>
          </select>
        </div>
      </div>

      <div className={s.fullGrid}>
        {PROPERTIES.map((p) => (
          <div key={p.id} className={s.propCard}>
            <div className={[s.propCardImg, p.colorClass === 'blue' ? s.blue : p.colorClass === 'amber' ? s.amber : ''].filter(Boolean).join(' ')}>
              {p.emoji}
              <span className={[s.propCardBadge, (s as Record<string,string>)[p.badgeClass]].join(' ')}>
                {p.badge}
              </span>
              <div className={s.propCardProgressWrap}>
                <div className={s.propCardProgressFill} style={{ width: `${p.funded}%` }} />
              </div>
            </div>

            <div className={s.propCardBody}>
              <div className={s.propCardType}>{p.type}</div>
              <div className={s.propCardTitle}>{p.title}</div>
              <div className={s.propCardAddr}>📍 {p.address}</div>

              <div className={s.propCardMetrics}>
                <div className={s.metricCell}>
                  <div className={s.metricVal}>{p.min}</div>
                  <div className={s.metricLbl}>Min. Pledge</div>
                </div>
                <div className={s.metricCell}>
                  <div className={s.metricVal}>{p.yield}</div>
                  <div className={s.metricLbl}>Proj. Yield</div>
                </div>
                <div className={s.metricCell}>
                  <div className={s.metricVal}>{p.raise}</div>
                  <div className={s.metricLbl}>Total Raise</div>
                </div>
              </div>

              <div className={s.fundingRow}>
                <span>{p.fundedLabel}</span>
                <strong>{p.raisedLabel}</strong>
              </div>
              <div className={s.fundingBarTrack}>
                <div className={s.fundingBarFill} style={{ width: `${p.funded}%` }} />
              </div>

              <button className={s.btnCardCta}>
                {p.funded === 100 ? 'View Details' : 'Pledge Now →'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
