'use client';

import { useEffect, useState } from 'react';
import s from './layout.module.css';

interface StoredUser {
  fullName: string;
  role: string;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function roleLabel(role: string) {
  if (role === 'admin' || role === 'super_admin') return 'Administrator';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function AdminSidebarUser() {
  const [user, setUser] = useState<StoredUser | null>(null);

  // Read after mount so the first render matches SSR (no hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw) as StoredUser);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  return (
    <div className={s.userRow}>
      <div className={s.avatar}>{user ? initials(user.fullName) : '··'}</div>
      <div className={s.userInfo}>
        <div className={s.userName}>{user?.fullName ?? 'Guest'}</div>
        <div className={s.userRole}>{user ? roleLabel(user.role) : '—'}</div>
      </div>
    </div>
  );
}
