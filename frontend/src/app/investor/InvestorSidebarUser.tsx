'use client';

import { useEffect, useState } from 'react';
import s from './layout.module.css';

interface StoredUser {
  fullName: string;
  role: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function kycView(kyc?: string) {
  if (kyc === 'approved') return { label: 'KYC Verified', sub: 'Account in good standing', color: 'var(--green-500, #22c55e)' };
  if (kyc === 'pending')  return { label: 'KYC Pending',  sub: 'Verification in progress', color: '#d97706' };
  if (kyc === 'rejected') return { label: 'KYC Rejected', sub: 'Action required',          color: '#dc2626' };
  return { label: 'Signed in', sub: 'Investor account', color: '#9ca3af' };
}

export default function InvestorSidebarUser() {
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

  const kyc = kycView(user?.kycStatus);

  return (
    <>
      <div className={s.kycBanner}>
        <span className={s.kycDot} style={{ background: kyc.color }} />
        <div>
          <div className={s.kycLabel}>{kyc.label}</div>
          <div className={s.kycSub}>{kyc.sub}</div>
        </div>
      </div>
      <div className={s.userRow}>
        <div className={s.avatar}>{user ? initials(user.fullName) : '··'}</div>
        <div className={s.userInfo}>
          <div className={s.userName}>{user?.fullName ?? 'Guest'}</div>
          <div className={s.userRole}>
            {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
          </div>
        </div>
      </div>
    </>
  );
}
