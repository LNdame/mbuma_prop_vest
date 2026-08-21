'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface SettingsDto {
  withholdingTaxPct: number;
  invitationExpiryDays: number;
  sessionHours: number;
  defaultMinPledge: number;
  supportEmail: string | null;
  publicSiteUrl: string | null;
  publicSiteUrlLocked: boolean;
  updatedAt: string | null;
}

type FieldErrors = Partial<Record<keyof SettingsDto, string>>;

const numOrEmpty = (v: number) => (Number.isFinite(v) ? String(v) : '');

export default function AdminSettingsPage() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState<SettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    try {
      const u = JSON.parse(localStorage.getItem('user') ?? '{}');
      setRole(u.role ?? '');
    } catch { /* ignore */ }

    fetch(`${API}/api/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Failed to load (${r.status})`);
        return r.json();
      })
      .then((j) => setForm(j.data as SettingsDto))
      .catch((e) => setBanner({ ok: false, msg: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  const canEdit = role === 'super_admin';

  function set<K extends keyof SettingsDto>(k: K, v: SettingsDto[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setErrors({});
    setBanner(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields as FieldErrors);
        setBanner({ ok: false, msg: data.error ?? 'Could not save settings.' });
        return;
      }
      setForm(data.data as SettingsDto);
      setBanner({ ok: true, msg: 'Settings saved.' });
    } catch {
      setBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.title}>Settings</h1>
        <p className={s.sub}>Platform rules, your account, and who can administer PropVest.</p>
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab} ${s.active}`}>Platform</button>
        <button className={s.tab} disabled>Account <span className={s.soon}>SOON</span></button>
        <button className={s.tab} disabled>Team &amp; Roles <span className={s.lock}>🔒</span></button>
      </div>

      {loading ? (
        <div className={s.loading}>Loading settings…</div>
      ) : !form ? (
        banner && <div className={`${s.banner} ${s.bannerErr}`}>{banner.msg}</div>
      ) : (
        <>
          {banner && (
            <div className={`${s.banner} ${banner.ok ? s.bannerOk : s.bannerErr}`} role="status">
              {banner.msg}
            </div>
          )}
          {!canEdit && (
            <div className={s.readonly}>
              You can view these settings, but only a <b>super admin</b> can change them.
            </div>
          )}

          {/* Money & distributions */}
          <div className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.cardTitle}>Money &amp; distributions</h2>
              <span className={`${s.badge} ${s.badgeSa}`}>SUPER ADMIN</span>
            </div>
            <p className={s.cardDesc}>How income is split and taxed when you run a distribution.</p>
            <div className={s.row}>
              <div className={s.field}>
                <label className={s.label} htmlFor="tax">Withholding tax rate</label>
                <div className={`${s.inWrap} ${errors.withholdingTaxPct ? s.invalid : ''}`}>
                  <input id="tax" type="number" step="0.5" min="0" max="100" disabled={!canEdit}
                    value={numOrEmpty(form.withholdingTaxPct)}
                    onChange={(e) => set('withholdingTaxPct', e.target.valueAsNumber)} />
                  <span className={s.unit}>%</span>
                </div>
                {errors.withholdingTaxPct
                  ? <span className={s.err}>{errors.withholdingTaxPct}</span>
                  : <span className={s.hint}>Deducted from each pledge&apos;s gross distribution income.</span>}
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="minp">Default minimum pledge</label>
                <div className={`${s.inWrap} ${errors.defaultMinPledge ? s.invalid : ''}`}>
                  <span className={s.pre}>R</span>
                  <input id="minp" type="number" step="100" min="0" disabled={!canEdit}
                    value={numOrEmpty(form.defaultMinPledge)}
                    onChange={(e) => set('defaultMinPledge', e.target.valueAsNumber)} />
                </div>
                {errors.defaultMinPledge
                  ? <span className={s.err}>{errors.defaultMinPledge}</span>
                  : <span className={s.hint}>Used when a property doesn&apos;t set its own minimum.</span>}
              </div>
            </div>
          </div>

          {/* Access & invitations */}
          <div className={s.card}>
            <div className={s.cardHead}>
              <h2 className={s.cardTitle}>Access &amp; invitations</h2>
              <span className={`${s.badge} ${s.badgeSa}`}>SUPER ADMIN</span>
            </div>
            <p className={s.cardDesc}>How long invitation links and login sessions stay valid.</p>
            <div className={s.row}>
              <div className={s.field}>
                <label className={s.label} htmlFor="inv">Invitation link expiry</label>
                <div className={`${s.inWrap} ${errors.invitationExpiryDays ? s.invalid : ''}`}>
                  <input id="inv" type="number" step="1" min="1" max="90" disabled={!canEdit}
                    value={numOrEmpty(form.invitationExpiryDays)}
                    onChange={(e) => set('invitationExpiryDays', e.target.valueAsNumber)} />
                  <span className={s.unit}>days</span>
                </div>
                {errors.invitationExpiryDays
                  ? <span className={s.err}>{errors.invitationExpiryDays}</span>
                  : <span className={s.hint}>After this, an invite link shows as expired.</span>}
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="sess">Login session length</label>
                <div className={`${s.inWrap} ${errors.sessionHours ? s.invalid : ''}`}>
                  <input id="sess" type="number" step="1" min="1" max="720" disabled={!canEdit}
                    value={numOrEmpty(form.sessionHours)}
                    onChange={(e) => set('sessionHours', e.target.valueAsNumber)} />
                  <span className={s.unit}>hours</span>
                </div>
                {errors.sessionHours
                  ? <span className={s.err}>{errors.sessionHours}</span>
                  : <span className={s.hint}>How long a login stays valid before re-authenticating.</span>}
              </div>
            </div>
          </div>

          {/* Contact & links */}
          <div className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>Contact &amp; links</h2></div>
            <div className={s.row}>
              <div className={s.field}>
                <label className={s.label} htmlFor="sup">Support email</label>
                <div className={`${s.inWrap} ${errors.supportEmail ? s.invalid : ''}`}>
                  <input id="sup" type="email" placeholder="support@mbumapropvest.com" disabled={!canEdit}
                    value={form.supportEmail ?? ''}
                    onChange={(e) => set('supportEmail', e.target.value)} />
                </div>
                {errors.supportEmail
                  ? <span className={s.err}>{errors.supportEmail}</span>
                  : <span className={s.hint}>Shown to investors who need help.</span>}
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="url">Public site URL</label>
                <div className={`${s.inWrap} ${form.publicSiteUrlLocked ? s.disabled : ''} ${errors.publicSiteUrl ? s.invalid : ''}`}>
                  <input id="url" type="text" placeholder="https://mbumapropvest.com"
                    disabled={!canEdit || form.publicSiteUrlLocked}
                    value={form.publicSiteUrl ?? ''}
                    onChange={(e) => set('publicSiteUrl', e.target.value)} />
                </div>
                {errors.publicSiteUrl
                  ? <span className={s.err}>{errors.publicSiteUrl}</span>
                  : <span className={s.hint}>Used to build invitation links.</span>}
              </div>
            </div>
            {form.publicSiteUrlLocked && (
              <div className={s.note}>
                <span className={s.noteI}>!</span>
                <span>The public site URL is set by a deployment variable (APP_URL), so it can&apos;t be edited here.</span>
              </div>
            )}
          </div>

          <div className={s.footer}>
            <span className={s.meta}>
              {form.updatedAt ? `Last updated ${new Date(form.updatedAt).toLocaleString('en-ZA')}` : 'Using default values'}
            </span>
            {canEdit && (
              <div className={s.actions}>
                <button className={`${s.btn} ${s.primary}`} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
