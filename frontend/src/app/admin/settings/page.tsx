'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';
import PlatformTab from './PlatformTab';
import AccountTab from './AccountTab';

type Tab = 'platform' | 'account';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('platform');
  const [role, setRole] = useState('');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') ?? '{}');
      setRole(u.role ?? '');
    } catch { /* ignore */ }
  }, []);

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Settings</h1>
        <p className={s.sub}>Platform rules, your account, and who can administer PropVest.</p>
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'platform' ? s.active : ''}`} onClick={() => setTab('platform')}>
          Platform
        </button>
        <button className={`${s.tab} ${tab === 'account' ? s.active : ''}`} onClick={() => setTab('account')}>
          Account
        </button>
        <button className={s.tab} disabled>Team &amp; Roles <span className={s.lock}>🔒</span></button>
      </div>

      {tab === 'platform' ? <PlatformTab role={role} /> : <AccountTab />}
    </div>
  );
}
