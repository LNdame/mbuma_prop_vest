import Image from 'next/image';
import s from '../app/page.module.css';
import NavAuth from './NavAuth';

export default function PublicHeader() {
  return (
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
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/#about">About</a></li>
        </ul>

        <NavAuth />
      </div>
    </nav>
  );
}
