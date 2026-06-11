'use client';

import { useState, useEffect, useRef } from 'react';
import s from '../app/page.module.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

function roleLabel(role: string) {
  if (role === 'admin' || role === 'super_admin') return 'Administrator';
  if (role === 'investor') return 'Investor';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function NavAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read auth state after mount (client-only) — first render matches the SSR
  // logged-out markup, so there's no hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (raw && token) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  // Close the dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOpen(false);
    window.location.href = '/';
  }

  // Logged out — original CTAs
  if (!user) {
    return (
      <div className={s.navActions}>
        <a href="/login" className={s.btnGhost}>Log In</a>
        <a href="/#about" className={s.btnPrimary}>Request an Invitation</a>
      </div>
    );
  }

  // Logged in — user menu
  const dashboard =
    user.role === 'admin' || user.role === 'super_admin'
      ? '/admin/dashboard'
      : '/investor/dashboard';

  return (
    <div className={s.userMenu} ref={ref}>
      <button
        type="button"
        className={s.userTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={s.userAvatar}>{initials(user.fullName)}</span>
        <span className={s.userText}>
          <span className={s.userName}>{user.fullName}</span>
          <span className={s.userRole}>{roleLabel(user.role)}</span>
        </span>
        <span className={[s.userChevron, open ? s.userChevronOpen : ''].join(' ')}>▾</span>
      </button>

      {open && (
        <div className={s.userDropdown} role="menu">
          <a href={dashboard} className={s.userDropItem} role="menuitem">
            <span className={s.userDropIcon}>⌂</span> Dashboard
          </a>
          <button type="button" className={s.userDropItem} role="menuitem" onClick={signOut}>
            <span className={s.userDropIcon}>↪</span> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
