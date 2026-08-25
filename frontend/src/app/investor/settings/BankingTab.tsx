'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ProfileDto {
  bankName: string | null; bankAccountNumber: string | null; bankBranchCode: string | null;
}

export default function BankingTab() {
  const [form, setForm] = useState({ bankName: '', bankAccountNumber: '', bankBranchCode: '' });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  const H = (json = false): Record<string, string> => {
    const t = localStorage.getItem('token');
    return json ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { Authorization: `Bearer ${t}` };
  };

  useEffect(() => {
    fetch(`${API}/api/account/investor-profile`, { headers: H() })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Failed to load (${r.status})`); return r.json(); })
      .then((j) => { const p = j.data as ProfileDto; setForm({ bankName: p.bankName ?? '', bankAccountNumber: p.bankAccountNumber ?? '', bankBranchCode: p.bankBranchCode ?? '' }); setLoaded(true); })
      .catch((e) => setBanner({ ok: false, msg: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setErrors({}); setBanner(null);
    try {
      const res = await fetch(`${API}/api/account/banking`, { method: 'PUT', headers: H(true), body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { if (data.fields) setErrors(data.fields); setBanner({ ok: false, msg: data.error ?? 'Could not save banking details.' }); return; }
      const p = data.data as ProfileDto;
      setForm({ bankName: p.bankName ?? '', bankAccountNumber: p.bankAccountNumber ?? '', bankBranchCode: p.bankBranchCode ?? '' });
      setBanner({ ok: true, msg: 'Banking details saved.' });
    } catch { setBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className={s.loading}>Loading banking details…</div>;
  if (!loaded) return banner ? <div className={`${s.banner} ${s.bannerErr}`}>{banner.msg}</div> : null;

  return (
    <div className={s.card}>
      <div className={s.cardHead}><h2 className={s.cardTitle}>Banking details</h2></div>
      <p className={s.cardDesc}>Where your monthly distributions are paid. Make sure these match your bank account exactly.</p>
      {banner && <div className={`${s.banner} ${banner.ok ? s.bannerOk : s.bannerErr}`} role="status">{banner.msg}</div>}
      <div className={s.row}>
        <div className={`${s.field} ${s.full}`}>
          <label className={s.label} htmlFor="bank">Bank name</label>
          <div className={s.inWrap}><input id="bank" type="text" placeholder="e.g. Standard Bank" value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} /></div>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor="acc">Account number</label>
          <div className={`${s.inWrap} ${errors.bankAccountNumber ? s.invalid : ''}`}>
            <input id="acc" inputMode="numeric" placeholder="0000000000" value={form.bankAccountNumber} onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))} />
          </div>
          {errors.bankAccountNumber ? <span className={s.err}>{errors.bankAccountNumber}</span> : <span className={s.hint}>Digits only.</span>}
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor="branch">Branch code</label>
          <div className={`${s.inWrap} ${errors.bankBranchCode ? s.invalid : ''}`}>
            <input id="branch" inputMode="numeric" placeholder="000000" value={form.bankBranchCode} onChange={(e) => setForm((f) => ({ ...f, bankBranchCode: e.target.value }))} />
          </div>
          {errors.bankBranchCode && <span className={s.err}>{errors.bankBranchCode}</span>}
        </div>
      </div>
      <div className={s.footer}><div className={s.actions}>
        <button className={`${s.btn} ${s.primary}`} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div></div>
    </div>
  );
}
