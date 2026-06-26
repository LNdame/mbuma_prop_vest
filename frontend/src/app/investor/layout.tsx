import type { ReactNode } from 'react';
import s from './layout.module.css';
import InvestorSidebarUser from './InvestorSidebarUser';

const NAV_ITEMS = [
  { icon: '⌂', label: 'Dashboard',     href: '/investor/dashboard' },
  { icon: '🏘', label: 'Properties',    href: '/investor/properties' },
  { icon: '💼', label: 'My Portfolio',  href: '/investor/portfolio' },
  { icon: '💸', label: 'Distributions', href: '/investor/distributions' },
  { icon: '📄', label: 'Documents',     href: '/investor/documents' },
  { icon: '🪪', label: 'Verification',  href: '/investor/kyc' },
  { icon: '👤', label: 'My Profile',    href: '/investor/profile' },
];

export default function InvestorLayout({ children }: { children: ReactNode }) {
  return (
    <div className={s.shell}>
      {/* ── SIDEBAR ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <a href="/" className={s.logo}>
            <div className={s.logoMark}>M</div>
            <span className={s.logoText}>
              Mbuma <span>PropVest</span>
            </span>
          </a>
          <span className={s.investorBadge}>Investor</span>
        </div>

        <nav className={s.nav}>
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={s.navItem}>
              <span className={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          <InvestorSidebarUser />
          <a href="/" className={s.logoutLink}>← Back to site</a>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={s.main}>{children}</main>
    </div>
  );
}
