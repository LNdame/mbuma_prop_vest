import Image from 'next/image';
import s from './page.module.css';
import NavAuth from '@/components/NavAuth';

const MOCK_PROPERTIES = [
  {
    id: '1',
    imgClass: '',
    badge: 'Open',
    badgeClass: 'statusOpen',
    type: 'Residential',
    title: 'Sandown Residential Estate',
    address: 'Sandton, Gauteng',
    emoji: '🏘️',
    minInvestment: 'R1 000',
    projectedYield: '9.2%',
    totalValue: 'R4.2M',
    funded: 68,
    fundedLabel: '68% funded',
    raisedLabel: 'R2.86M raised',
  },
  {
    id: '2',
    imgClass: 'blue',
    badge: 'Open',
    badgeClass: 'statusOpen',
    type: 'Commercial',
    title: 'Century City Office Park',
    address: 'Cape Town, Western Cape',
    emoji: '🏢',
    minInvestment: 'R2 500',
    projectedYield: '10.8%',
    totalValue: 'R8.5M',
    funded: 43,
    fundedLabel: '43% funded',
    raisedLabel: 'R3.66M raised',
  },
  {
    id: '3',
    imgClass: 'amber',
    badge: 'Funded',
    badgeClass: 'statusFunded',
    type: 'Residential',
    title: 'Umhlanga Ridge Apartments',
    address: 'Durban, KwaZulu-Natal',
    emoji: '🏡',
    minInvestment: 'R1 500',
    projectedYield: '8.7%',
    totalValue: 'R3.1M',
    funded: 100,
    fundedLabel: '100% funded',
    raisedLabel: 'R3.1M raised',
  },
];

const FEATURES = [
  {
    icon: '🏦',
    title: 'Fractionalised Ownership',
    desc: 'Co-own institutional-grade properties with other investors. Each pledge represents a direct share in the asset.',
  },
  {
    icon: '📊',
    title: 'Monthly Distributions',
    desc: 'Receive your share of net rental income distributed monthly, directly to your bank account.',
  },
  {
    icon: '🔐',
    title: 'KYC & Compliance',
    desc: 'Fully FICA-compliant onboarding. All investors are verified before participating in any investment.',
  },
  {
    icon: '📄',
    title: 'Digital Agreements',
    desc: 'Investment agreements are generated and signed electronically via DocuSign — no paperwork required.',
  },
  {
    icon: '🏘️',
    title: 'Curated Properties',
    desc: 'Every property is vetted for location, yield potential, and legal standing before being listed on the platform.',
  },
  {
    icon: '📱',
    title: 'Real-time Dashboard',
    desc: 'Track your portfolio performance, funding progress, and distributions from one clean dashboard.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <a href="/" className={s.logo}>
            <Image src="/logo.png" alt="Mbuma PropVest logo" width={40} height={40} className={s.logoImg} priority />
            <span className={s.logoText}>
              Mbuma <span>PropVest</span>
            </span>
          </a>

          <ul className={s.navLinks}>
            <li><a href="/properties">Properties</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#about">About</a></li>
          </ul>

          <NavAuth />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroGrid}>
          {/* Left copy */}
          <div>
            <div className={s.heroEyebrow}>
              <span className={s.eyebrowDot} />
              Now accepting invitations
            </div>
            <h1 className={s.heroH1}>
              Property Investments,<br />
              <em>Built for Everyone.</em>
            </h1>
            <p className={s.heroSubtitle}>
              <strong>High minimums and opaque fees — not welcome.</strong>{' '}
              Curated South African properties, fractional ownership, and monthly
              distributions — all managed for you.
            </p>
            <div className={s.heroCtas}>
              <button className={s.btnHeroPrimary}>Request an Invitation →</button>
              <a href="/properties" className={s.btnHeroSecondary}>View Properties</a>
            </div>
            <p className={s.heroNote}>
              Invest from <span>R1 000</span> · FICA-compliant · Registered investors only
            </p>
          </div>

          {/* Right — floating property cards */}
          <div className={s.heroVisual}>
            <div className={s.heroCard}>
              <div className={s.heroCardImg}>
                🏘️
                <span className={s.heroCardBadge}>Open</span>
              </div>
              <div className={s.heroCardBody}>
                <div className={s.heroCardTitle}>Sandown Residential Estate</div>
                <div className={s.heroCardSub}>📍 Sandton, Gauteng</div>
                <div className={s.heroCardStats}>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Yield</span>
                    <span className={s.heroCardStatValue}>9.2%</span>
                  </div>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Min</span>
                    <span className={s.heroCardStatValue}>R1 000</span>
                  </div>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Funded</span>
                    <span className={s.heroCardStatValue}>68%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.heroCard}>
              <div className={`${s.heroCardImg} ${s.blue}`}>
                🏢
                <span className={s.heroCardBadge}>Open</span>
              </div>
              <div className={s.heroCardBody}>
                <div className={s.heroCardTitle}>Century City Office Park</div>
                <div className={s.heroCardSub}>📍 Cape Town, WC</div>
                <div className={s.heroCardStats}>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Yield</span>
                    <span className={s.heroCardStatValue}>10.8%</span>
                  </div>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Min</span>
                    <span className={s.heroCardStatValue}>R2 500</span>
                  </div>
                  <div className={s.heroCardStat}>
                    <span className={s.heroCardStatLabel}>Funded</span>
                    <span className={s.heroCardStatValue}>43%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.heroCard}>
              <div className={`${s.heroCardImg} ${s.amber}`}>🏡</div>
              <div className={s.heroCardBody}>
                <div className={s.heroCardTitle}>Umhlanga Ridge Apartments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={s.statsBar}>
        <div className={s.statsBarInner}>
          <div className={s.statItem}>
            <div className={s.statValue}>12</div>
            <div className={s.statLabel}>Properties Listed</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>R42M+</div>
            <div className={s.statLabel}>Total Capital Raised</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>840+</div>
            <div className={s.statLabel}>Verified Investors</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>9.4%</div>
            <div className={s.statLabel}>Average Net Yield</div>
          </div>
        </div>
      </div>

      {/* ── FEATURED PROPERTIES ── */}
      <section className={s.section} id="properties">
        <div className={s.sectionNarrow}>
          <div className={s.sectionHeader}>
            <div>
              <span className={s.sectionEyebrow}>Investment Opportunities</span>
              <h2 className={s.sectionTitle}>Featured Properties</h2>
              <p className={s.sectionSubtitle}>
                Curated, yield-producing properties available to verified investors.
                Pledge your share and earn monthly distributions.
              </p>
            </div>
            <a href="/properties" className={s.btnOutline}>View All Properties →</a>
          </div>

          <div className={s.propertyGrid}>
            {MOCK_PROPERTIES.map((p) => (
              <div key={p.id} className={s.propertyCard}>
                <div
                  className={[
                    s.propertyCardImg,
                    p.imgClass === 'blue' ? s.blue : '',
                    p.imgClass === 'amber' ? s.amber : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {p.emoji}
                  <span
                    className={[
                      s.statusBadge,
                      p.badgeClass === 'statusOpen' ? s.statusOpen : s.statusFunded,
                    ].join(' ')}
                  >
                    {p.badge}
                  </span>
                  <div className={s.progressWrap}>
                    <div className={s.progressBar} style={{ width: `${p.funded}%` }} />
                  </div>
                </div>

                <div className={s.propertyCardBody}>
                  <div className={s.propertyType}>{p.type}</div>
                  <div className={s.propertyTitle}>{p.title}</div>
                  <div className={s.propertyAddress}>📍 {p.address}</div>

                  <div className={s.propertyMetrics}>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{p.minInvestment}</div>
                      <div className={s.metricLabel}>Min. Pledge</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{p.projectedYield}</div>
                      <div className={s.metricLabel}>Proj. Yield</div>
                    </div>
                    <div className={s.metricCell}>
                      <div className={s.metricValue}>{p.totalValue}</div>
                      <div className={s.metricLabel}>Total Raise</div>
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
                    {p.funded === 100 ? 'View Details' : 'Pledge Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className={s.featuresSection}>
        <div className={s.sectionNarrow}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className={s.sectionEyebrow}>Why Mbuma PropVest</span>
            <h2 className={s.sectionTitle}>Everything handled for you</h2>
            <p className={s.sectionSubtitle} style={{ margin: '0 auto' }}>
              From due diligence to monthly payouts — we manage the complexity
              so you can focus on growing your portfolio.
            </p>
          </div>
          <div className={s.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={s.featureCard}>
                <div className={s.featureIcon}>{f.icon}</div>
                <div className={s.featureTitle}>{f.title}</div>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT: Fractionalised Ownership ── */}
      <section className={s.splitSection} id="how-it-works">
        <div className={s.splitGrid}>
          <div className={s.splitContent}>
            <span className={s.sectionEyebrow}>Fractionalised Ownership</span>
            <h2 className={s.sectionTitle}>Own a piece of premium real estate</h2>
            <p className={s.sectionSubtitle}>
              You don&apos;t need millions to invest in property. Mbuma PropVest
              splits each asset into affordable pledges — so you can build a
              diversified portfolio from day one.
            </p>
            <ul className={s.splitList}>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Start investing from as little as R1 000 per property
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Your pledge is backed by a registered investment agreement
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Receive proportional net rental distributions monthly
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Full visibility into property financials and occupancy
              </li>
            </ul>
          </div>
          <div style={{ position: 'relative' }}>
            <div className={s.splitVisual}>🏗️</div>
            <div className={`${s.floatCard} ${s.tl}`}>
              <div className={s.floatCardValue}>R1 000</div>
              <div className={s.floatCardLabel}>Minimum pledge</div>
            </div>
            <div className={`${s.floatCard} ${s.br}`}>
              <div className={s.floatCardValue}>9.4%</div>
              <div className={s.floatCardLabel}>Avg net yield</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT: Build Your Portfolio (dark) ── */}
      <section className={`${s.splitSection} ${s.dark}`}>
        <div className={`${s.splitGrid} ${s.reversed}`}>
          <div className={s.splitContent}>
            <span className={s.sectionEyebrow}>Build Your Portfolio</span>
            <h2 className={`${s.sectionTitle} ${s.dark}`}>
              Diversify across<br />property types
            </h2>
            <p className={`${s.sectionSubtitle} ${s.dark}`}>
              Spread your capital across residential, commercial, and mixed-use
              assets in multiple provinces — all from a single platform.
            </p>
            <ul className={s.splitList}>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Residential, commercial, and mixed-use properties
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Gauteng, Western Cape, KwaZulu-Natal, and more
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                New properties listed regularly for active investors
              </li>
              <li>
                <span className={s.splitListCheck}>✓</span>
                Portfolio dashboard with live distribution history
              </li>
            </ul>
          </div>
          <div className={s.splitVisualDark}>🗺️</div>
        </div>
      </section>

      {/* ── INVITATION CTA ── */}
      <section className={s.ctaSection} id="about">
        <div className={s.ctaInner}>
          <h2 className={s.ctaTitle}>Ready to invest in South African property?</h2>
          <p className={s.ctaSubtitle}>
            Mbuma PropVest is an invite-only platform. Enter your email and
            we&apos;ll reach out when a spot opens up.
          </p>
          <div className={s.ctaForm}>
            <input
              className={s.ctaInput}
              type="email"
              placeholder="your@email.com"
            />
            <button className={s.btnCtaSubmit}>Request Invitation</button>
          </div>
          <p className={s.ctaNote}>
            No spam. We&apos;ll only contact you with your invitation link.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <div className={s.logo}>
              <Image src="/logo.png" alt="Mbuma PropVest logo" width={40} height={40} className={s.logoImg} />
              <span className={s.logoText}>
                Mbuma <span>PropVest</span>
              </span>
            </div>
            <p>
              A fractionalised property investment platform connecting South
              African investors with curated, yield-producing real estate assets.
            </p>
          </div>

          <div>
            <div className={s.footerHeading}>Platform</div>
            <ul className={s.footerLinks}>
              <li><a href="/properties">Properties</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">Request Invitation</a></li>
              <li><a href="/login">Log In</a></li>
            </ul>
          </div>

          <div>
            <div className={s.footerHeading}>Company</div>
            <ul className={s.footerLinks}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">News</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <div className={s.footerHeading}>Legal</div>
            <ul className={s.footerLinks}>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">FICA Compliance</a></li>
              <li><a href="#">Risk Disclosure</a></li>
            </ul>
          </div>
        </div>

        <div className={s.footerBottom}>
          <p className={s.footerLegal}>
            © {new Date().getFullYear()} Mbuma PropVest (Pty) Ltd. All rights reserved.
          </p>
          <p className={s.footerLegal}>
            Investments involve risk. Past performance is not indicative of future results.
            Please read our <a href="#">Risk Disclosure</a> before investing.
          </p>
        </div>
      </footer>
    </>
  );
}
