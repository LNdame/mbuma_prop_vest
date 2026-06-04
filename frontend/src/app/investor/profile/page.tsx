import s from '../investor.module.css';

export default function InvestorProfile() {
  return (
    <div className={s.page}>

      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>My Profile</h1>
          <p className={s.pageSub}>Manage your personal details, KYC status, and banking information</p>
        </div>
      </div>

      {/* KYC status banner */}
      <div className={s.kycCard}>
        <div className={s.kycCardLeft}>
          <div className={s.kycBigDot}>✓</div>
          <div>
            <div className={s.kycCardTitle}>KYC Verified</div>
            <div className={s.kycCardSub}>Your identity has been verified. You are approved to invest on the platform.</div>
          </div>
        </div>
        <button className={s.btnKycAction}>View Documents →</button>
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
                <input className={s.formInput} defaultValue="Sipho Khumalo" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Email Address</label>
                <input className={s.formInput} defaultValue="sipho@email.com" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Phone Number</label>
                <input className={s.formInput} defaultValue="+27 82 555 0123" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>ID / Passport Number</label>
                <input className={s.formInput} defaultValue="8512155088086" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>ID Type</label>
                <input className={s.formInput} defaultValue="South African ID Book" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Tax Number (SARS)</label>
                <input className={s.formInput} defaultValue="9123456789" disabled />
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
                <input className={s.formInput} defaultValue="12 Protea Avenue" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>City</label>
                <input className={s.formInput} defaultValue="Johannesburg" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Province</label>
                <input className={s.formInput} defaultValue="Gauteng" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Postal Code</label>
                <input className={s.formInput} defaultValue="2196" disabled />
              </div>
            </div>
          </div>

        </div>

        <div className={s.rightCol}>

          {/* Banking details */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Banking Details</span>
              <button className={s.btnSm}>Edit</button>
            </div>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.formLabel}>Bank Name</label>
                <input className={s.formInput} defaultValue="First National Bank" disabled />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.formLabel}>Account Number</label>
                <input className={s.formInput} defaultValue="62 *** *** 4" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Branch Code</label>
                <input className={s.formInput} defaultValue="250655" disabled />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Account Type</label>
                <input className={s.formInput} defaultValue="Cheque / Current" disabled />
              </div>
            </div>
            <div className={s.panelFooter}>
              <p style={{ fontSize: 12, color: 'var(--neutral-500)', lineHeight: 1.6 }}>
                Banking details are used exclusively for distribution payments. Changes require re-verification.
              </p>
            </div>
          </div>

          {/* Account info */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelTitle}>Account</span>
            </div>
            {[
              { label: 'Member since',    value: 'January 2025' },
              { label: 'Account status',  value: 'Active' },
              { label: 'KYC status',      value: 'Verified', accent: true },
              { label: 'Role',            value: 'Investor' },
              { label: 'Total invested',  value: 'R350,000', accent: true },
              { label: 'Active pledges',  value: '3' },
            ].map((g) => (
              <div key={g.label} className={s.glanceRow}>
                <span className={s.glanceLabel}>{g.label}</span>
                <span className={[s.glanceVal, (g as { accent?: boolean }).accent ? s.accent : ''].filter(Boolean).join(' ')}>
                  {g.value}
                </span>
              </div>
            ))}
            <div className={s.panelFooter}>
              <button className={s.btnOutline} style={{ color: '#C0392B', borderColor: '#e8b4b0' }}>
                Change Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
