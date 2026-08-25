'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Account { id: string; fullName: string; email: string; phone: string | null; role: string; }

export default function AccountTab() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // profile form
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileBanner, setProfileBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  // password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwBanner, setPwBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/account`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Failed to load (${r.status})`);
        return r.json();
      })
      .then((j) => {
        const a = j.data as Account;
        setAcct(a);
        setProfile({ fullName: a.fullName, email: a.email, phone: a.phone ?? '' });
      })
      .catch((e) => setProfileBanner({ ok: false, msg: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileErrors({});
    setProfileBanner(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/account`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setProfileErrors(data.fields);
        setProfileBanner({ ok: false, msg: data.error ?? 'Could not save your profile.' });
        return;
      }
      const a = data.data as Account;
      setAcct(a);
      setProfile({ fullName: a.fullName, email: a.email, phone: a.phone ?? '' });
      // Keep the locally stored user (sidebar / nav) in sync.
      try {
        const stored = JSON.parse(localStorage.getItem('user') ?? '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, fullName: a.fullName, email: a.email }));
      } catch { /* ignore */ }
      setProfileBanner({ ok: true, msg: 'Profile updated.' });
    } catch {
      setProfileBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPw(true);
    setPwErrors({});
    setPwBanner(null);
    if (pw.newPassword !== pw.confirm) {
      setPwErrors({ confirm: 'Passwords do not match.' });
      setSavingPw(false);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/account/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setPwErrors(data.fields);
        setPwBanner({ ok: false, msg: data.error ?? 'Could not change your password.' });
        return;
      }
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwBanner({ ok: true, msg: 'Password changed.' });
    } catch {
      setPwBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' });
    } finally {
      setSavingPw(false);
    }
  }

  if (loading) return <div className={s.loading}>Loading your account…</div>;
  if (!acct) return profileBanner ? <div className={`${s.banner} ${s.bannerErr}`}>{profileBanner.msg}</div> : null;

  return (
    <>
      {/* My profile */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>My profile</h2></div>
        <p className={s.cardDesc}>Your name and contact details. Your email is also how you sign in.</p>
        {profileBanner && (
          <div className={`${s.banner} ${profileBanner.ok ? s.bannerOk : s.bannerErr}`} role="status">{profileBanner.msg}</div>
        )}
        <div className={s.row}>
          <div className={s.field}>
            <label className={s.label} htmlFor="fn">Full name</label>
            <div className={`${s.inWrap} ${profileErrors.fullName ? s.invalid : ''}`}>
              <input id="fn" type="text" value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
            </div>
            {profileErrors.fullName && <span className={s.err}>{profileErrors.fullName}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="ph">Phone</label>
            <div className={`${s.inWrap} ${profileErrors.phone ? s.invalid : ''}`}>
              <input id="ph" type="tel" placeholder="+27 …" value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            {profileErrors.phone && <span className={s.err}>{profileErrors.phone}</span>}
          </div>
          <div className={`${s.field} ${s.full}`}>
            <label className={s.label} htmlFor="em">Email address</label>
            <div className={`${s.inWrap} ${profileErrors.email ? s.invalid : ''}`}>
              <input id="em" type="email" value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            </div>
            {profileErrors.email
              ? <span className={s.err}>{profileErrors.email}</span>
              : <span className={s.hint}>Used to sign in and for account notices.</span>}
          </div>
        </div>
        <div className={s.footer}>
          <div className={s.actions}>
            <button className={`${s.btn} ${s.primary}`} onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Change password</h2></div>
        <p className={s.cardDesc}>Enter your current password, then choose a new one (at least 8 characters).</p>
        {pwBanner && (
          <div className={`${s.banner} ${pwBanner.ok ? s.bannerOk : s.bannerErr}`} role="status">{pwBanner.msg}</div>
        )}
        <div className={s.row}>
          <div className={`${s.field} ${s.full}`}>
            <label className={s.label} htmlFor="cp">Current password</label>
            <div className={`${s.inWrap} ${pwErrors.currentPassword ? s.invalid : ''}`}>
              <input id="cp" type="password" autoComplete="current-password" placeholder="••••••••"
                value={pw.currentPassword}
                onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            {pwErrors.currentPassword && <span className={s.err}>{pwErrors.currentPassword}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="np">New password</label>
            <div className={`${s.inWrap} ${pwErrors.newPassword ? s.invalid : ''}`}>
              <input id="np" type="password" autoComplete="new-password" placeholder="••••••••"
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} />
            </div>
            {pwErrors.newPassword && <span className={s.err}>{pwErrors.newPassword}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="np2">Confirm new password</label>
            <div className={`${s.inWrap} ${pwErrors.confirm ? s.invalid : ''}`}>
              <input id="np2" type="password" autoComplete="new-password" placeholder="••••••••"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            {pwErrors.confirm && <span className={s.err}>{pwErrors.confirm}</span>}
          </div>
        </div>
        <div className={s.footer}>
          <div className={s.actions}>
            <button className={`${s.btn} ${s.primary}`} onClick={changePassword}
              disabled={savingPw || !pw.currentPassword || !pw.newPassword || !pw.confirm}>
              {savingPw ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
