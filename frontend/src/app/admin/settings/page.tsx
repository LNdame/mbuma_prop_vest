'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';
import PlatformTab from './PlatformTab';
import AccountTab from './AccountTab';
import TeamTab from './TeamTab';

type Tab = 'platform' | 'account' | 'team';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('platform');
  const [role, setRole] = useState('');
  const [selfId, setSelfId] = useState('');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') ?? '{}');
      setRole(u.role ?? '');
      setSelfId(u.id ?? '');
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
        <button className={`${s.tab} ${tab === 'team' ? s.active : ''}`} onClick={() => setTab('team')}>
          Team &amp; Roles {role !== 'super_admin' && <span className={s.lock}>🔒</span>}
        </button>
      </div>

      {tab === 'platform' && <PlatformTab role={role} />}
      {tab === 'account' && <AccountTab />}
      {tab === 'team' && <TeamTab role={role} selfId={selfId} />}
    </div>
  );
}
