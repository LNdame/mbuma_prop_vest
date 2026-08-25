'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ProfileDto {
  kycStatus: string; idLocked: boolean;
  idNumber: string | null; idType: string | null; taxNumber: string | null;
  addressLine1: string | null; city: string | null; province: string | null; postalCode: string | null;
}

const emptyForm = { idNumber: '', idType: '', taxNumber: '', addressLine1: '', city: '', province: '', postalCode: '' };

export default function PersonalTab() {
  const [form, setForm] = useState(emptyForm);
  const [idLocked, setIdLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  const H = (json = false): Record<string, string> => {
    const t = localStorage.getItem('token');
    return json ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { Authorization: `Bearer ${t}` };
  };

  function hydrate(p: ProfileDto) {
    setIdLocked(p.idLocked);
    setForm({
      idNumber: p.idNumber ?? '', idType: p.idType ?? '', taxNumber: p.taxNumber ?? '',
      addressLine1: p.addressLine1 ?? '', city: p.city ?? '', province: p.province ?? '', postalCode: p.postalCode ?? '',
    });
  }

  useEffect(() => {
    fetch(`${API}/api/account/investor-profile`, { headers: H() })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Failed to load (${r.status})`); return r.json(); })
      .then((j) => { hydrate(j.data as ProfileDto); setLoaded(true); })
      .catch((e) => setBanner({ ok: false, msg: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  function set(k: keyof typeof emptyForm, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true); setErrors({}); setBanner(null);
    try {
      const res = await fetch(`${API}/api/account/personal`, { method: 'PUT', headers: H(true), body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { if (data.fields) setErrors(data.fields); setBanner({ ok: false, msg: data.error ?? 'Could not save personal details.' }); return; }
      hydrate(data.data as ProfileDto);
      setBanner({ ok: true, msg: 'Personal details saved.' });
    } catch { setBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className={s.loading}>Loading personal details…</div>;
  if (!loaded) return banner ? <div className={`${s.banner} ${s.bannerErr}`}>{banner.msg}</div> : null;

  return (
    <>
      {banner && <div className={`${s.banner} ${banner.ok ? s.bannerOk : s.bannerErr}`} role="status">{banner.msg}</div>}

      {/* Identity */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Identity</h2></div>
        <div className={s.row}>
          <div className={s.field}>
            <label className={s.label} htmlFor="idType">ID type</label>
            <div className={`${s.inWrap} ${idLocked ? s.disabled : ''} ${errors.idType ? s.invalid : ''}`}>
              <select id="idType" disabled={idLocked} value={form.idType} onChange={(e) => set('idType', e.target.value)}
                style={{ border: 0, outline: 0, background: 'none', font: 'inherit', fontSize: '13.5px', padding: '9px 11px', width: '100%' }}>
                <option value="">—</option>
                <option value="id_book">South African ID Book</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver&apos;s License</option>
              </select>
            </div>
            {errors.idType && <span className={s.err}>{errors.idType}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="idNumber">ID / passport number</label>
            <div className={`${s.inWrap} ${idLocked ? s.disabled : ''}`}>
              <input id="idNumber" type="text" disabled={idLocked} value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} />
            </div>
          </div>
        </div>
        {idLocked && (
          <div className={s.note}><span className={s.noteI}>!</span>
            <span>Your identity has been verified, so ID details are locked. Contact support if they need to change.</span></div>
        )}
      </div>

      {/* Address & tax */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Address &amp; tax</h2></div>
        <div className={s.row}>
          <div className={`${s.field} ${s.full}`}>
            <label className={s.label} htmlFor="addr">Street address</label>
            <div className={s.inWrap}><input id="addr" type="text" value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} /></div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="city">City</label>
            <div className={s.inWrap}><input id="city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="prov">Province</label>
            <div className={s.inWrap}><input id="prov" type="text" value={form.province} onChange={(e) => set('province', e.target.value)} /></div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="postal">Postal code</label>
            <div className={`${s.inWrap} ${errors.postalCode ? s.invalid : ''}`}>
              <input id="postal" inputMode="numeric" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
            </div>
            {errors.postalCode && <span className={s.err}>{errors.postalCode}</span>}
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="tax">Tax number</label>
            <div className={s.inWrap}><input id="tax" type="text" value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} /></div>
          </div>
        </div>
        <div className={s.footer}><div className={s.actions}>
          <button className={`${s.btn} ${s.primary}`} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div></div>
      </div>
    </>
  );
}
