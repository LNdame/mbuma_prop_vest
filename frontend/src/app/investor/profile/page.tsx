'use client';

import s from '../investor.module.css';
import { useMe } from '../../../lib/useMe';

function dash(v: string | null | undefined) {
  return v && String(v).trim() ? String(v) : '—';
}
function fmtRand(n: number) {
  if (!n) return 'R0';
  return 'R' + Math.round(n).toLocaleString('en-ZA');
}
function idTypeLabel(t: string | null) {
  if (t === 'id_book')         return 'South African ID Book';
  if (t === 'passport')        return 'Passport';
  if (t === 'drivers_license') return "Driver's License";
  return '—';
}
function memberSince(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

export default function InvestorProfile() {
  const { me, loading, error } = useMe();

  if (loading) {
    return <div className={s.page}><div className={s.emptyState}>Loading your profile…</div></div>;
  }
  if (error === 'unauthenticated') {
    return (
      <div className={s.page}>
        <div className={s.emptyState}>Please <a href="/login" className={s.panelLink}>log in</a> to view your profile.</div>
      </div>
    );
  }
  if (error || !me) {
    return <div className={s.page}><div className={s.emptyState}>Couldn’t load your profile. {error}</div></div>;
  }

  const p = me.investorProfile;
  const confirmed = me.pledges.filter((pl) => pl.status === 'confirmed');
  const totalInvested = confirmed.reduce((sum, pl) => sum + Number(pl.amount), 0);
  const activePledges = me.pledges.filter((pl) => pl.status !== 'cancelled').length;

  const kycVerified = me.kycStatus === 'approved';
  const kycLabel = kycVerified ? 'Verified'
                 : me.kycStatus === 'rejected'     ? 'Rejected'
                 : me.kycStatus === 'under_review' ? 'Under review'
                 : 'Pending';

  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>My Profile</h1>
          <p className={s.pageSub}>Your personal details and KYC status. Manage banking in Settings.</p>
        </div>
      </div>

      {/* KYC status banner */}
      <div className={s.kycCard}>
        <div className={s.kycCardLeft}>
          <div className={s.kycBigDot}>{kycVerified ? '✓' : '!'}</div>
          <div>
            <div className={s.kycCardTitle}>KYC {kycLabel}</div>
            <div className={s.kycCardSub}>
              {kycVerified
                ? 'Your identity has been verified. You are approved to pledge on the platform.'
                : 'Your identity verification is ' + kycLabel.toLowerCase() + '. Some actions may be limited until verified.'}
            </div>
          </div>
        </div>
        <a href={kycVerified ? '/investor/documents' : '/investor/kyc'} className={s.btnKycAction}>
          {kycVerified ? 'View Documents →' : 'Complete verification →'}
        </a>
      </div>

      <div className={s.mainGrid}>
        <div className={s.leftCol}>

          {/* Personal info */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Personal Information</span>
              <button className={s.btnSm}>Edit</button>
            </div>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Full Name</label>
                <input className={s.formInput} value={dash(me.fullName)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Email Address</label>
                <input className={s.formInput} value={dash(me.email)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Phone Number</label>
                <input className={s.formInput} value={dash(me.phone)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>ID / Passport Number</label>
                <input className={s.formInput} value={dash(p?.idNumber)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>ID Type</label>
                <input className={s.formInput} value={idTypeLabel(p?.idType ?? null)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Tax Number (SARS)</label>
                <input className={s.formInput} value={dash(p?.taxNumber)} disabled />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Residential Address</span>
              <button className={s.btnSm}>Edit</button>
            </div>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.formLabel}>Address Line 1</label>
                <input className={s.formInput} value={dash(p?.addressLine1)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>City</label>
                <input className={s.formInput} value={dash(p?.city)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Province</label>
                <input className={s.formInput} value={dash(p?.province)} disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Postal Code</label>
                <input className={s.formInput} value={dash(p?.postalCode)} disabled />
              </div>
            </div>
          </div>

        </div>

        <div className={s.rightCol}>

          {/* Account info */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Account</span>
            </div>
            {[
              { label: 'Member since',   value: memberSince(me.createdAt) },
              { label: 'Account status', value: me.isActive ? 'Active' : 'Inactive' },
              { label: 'KYC status',     value: kycLabel, accent: kycVerified },
              { label: 'Role',           value: me.role.charAt(0).toUpperCase() + me.role.slice(1) },
              { label: 'Total invested', value: fmtRand(totalInvested), accent: true },
              { label: 'Active pledges', value: String(activePledges) },
            ].map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>{g.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
