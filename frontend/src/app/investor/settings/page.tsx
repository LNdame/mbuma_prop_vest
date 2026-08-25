'use client';

import { useState } from 'react';
import s from './settings.module.css';
import AccountTab from './AccountTab';
import BankingTab from './BankingTab';
import PersonalTab from './PersonalTab';

type Tab = 'account' | 'banking' | 'personal';

export default function InvestorSettingsPage() {
  const [tab, setTab] = useState<Tab>('account');

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Settings</h1>
        <p className={s.sub}>Manage your account, banking, and personal details.</p>
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'account' ? s.active : ''}`} onClick={() => setTab('account')}>Account</button>
        <button className={`${s.tab} ${tab === 'banking' ? s.active : ''}`} onClick={() => setTab('banking')}>Banking</button>
        <button className={`${s.tab} ${tab === 'personal' ? s.active : ''}`} onClick={() => setTab('personal')}>Personal</button>
      </div>

      {tab === 'account' && <AccountTab />}
      {tab === 'banking' && <BankingTab />}
      {tab === 'personal' && <PersonalTab />}
    </div>
  );
}
