import type { ReactNode } from 'react';
import s from './layout.module.css';

const NAV_ITEMS = [
  { icon: '⌂', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '🏘', label: 'Properties', href: '/admin/properties' },
  { icon: '👤', label: 'Investors', href: '/admin/investors' },
  { icon: '💸', label: 'Distributions', href: '/admin/distributions' },
  { icon: '📄', label: 'Agreements', href: '/admin/agreements' },
  { icon: '📊', label: 'Reports', href: '/admin/reports' },
  { icon: '⚙', label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
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
          <span className={s.adminBadge}>Admin</span>
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
          <div className={s.userRow}>
            <div className={s.avatar}>TK</div>
            <div className={s.userInfo}>
              <div className={s.userName}>Thabo K.</div>
              <div className={s.userRole}>Administrator</div>
            </div>
          </div>
          <a href="/" className={s.logoutLink}>← Back to site</a>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={s.main}>{children}</main>
    </div>
  );
}
