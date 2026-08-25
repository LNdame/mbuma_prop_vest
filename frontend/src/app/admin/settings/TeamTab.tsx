'use client';

import { useEffect, useState } from 'react';
import s from './settings.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Admin { id: string; fullName: string; email: string; role: string; isActive: boolean; createdAt: string; }
interface PendingInvite { id: string; email: string; role: string; expiresAt: string; createdAt: string; }

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase();
}
function roleLabel(r: string) { return r === 'super_admin' ? 'Super admin' : 'Admin'; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function TeamTab({ role, selfId }: { role: string; selfId: string }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const canManage = role === 'super_admin';

  function authHeaders(json = false): Record<string, string> {
    const t = localStorage.getItem('token');
    return json ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { Authorization: `Bearer ${t}` };
  }

  async function load() {
    try {
      const r = await fetch(`${API}/api/settings/admins`, { headers: authHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Failed to load (${r.status})`);
      const j = await r.json();
      setAdmins(j.data.admins);
      setInvites(j.data.pendingInvites);
    } catch (e) {
      setBanner({ ok: false, msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (canManage) load(); else setLoading(false); }, [canManage]);

  async function patch(id: string, body: { role?: string; isActive?: boolean }) {
    setBusyId(id);
    setBanner(null);
    try {
      const r = await fetch(`${API}/api/settings/admins/${id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setBanner({ ok: false, msg: j.error ?? 'Could not update administrator.' }); return; }
      setAdmins((list) => list.map((a) => (a.id === id ? { ...a, ...j.data } : a)));
      setBanner({ ok: true, msg: 'Administrator updated.' });
    } catch {
      setBanner({ ok: false, msg: 'Unable to reach the server. Please try again.' });
    } finally {
      setBusyId(null);
    }
  }

  async function invite() {
    setInviting(true);
    setInviteErr('');
    setInviteLink('');
    setBanner(null);
    try {
      const r = await fetch(`${API}/api/settings/admins/invite`, {
        method: 'POST', headers: authHeaders(true), body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setInviteErr(j.fields?.email ?? j.error ?? 'Could not create the invitation.'); return; }
      setInviteLink(j.data.inviteLink);
      setInviteEmail('');
      setBanner({ ok: true, msg: `Invitation created for ${j.data.email}.` });
      load();
    } catch {
      setInviteErr('Unable to reach the server. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  if (!canManage) {
    return <div className={s.readonly}>Only a <b>super admin</b> can manage administrators and roles.</div>;
  }
  if (loading) return <div className={s.loading}>Loading administrators…</div>;

  return (
    <>
      {banner && (
        <div className={`${s.banner} ${banner.ok ? s.bannerOk : s.bannerErr}`} role="status">{banner.msg}</div>
      )}

      {/* Administrators */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>Administrators</h2>
          <span className={`${s.badge} ${s.badgeSa}`}>SUPER ADMIN</span>
        </div>
        <p className={s.cardDesc}>People who can access the admin area. You can’t change your own role or status.</p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Administrator</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === selfId;
                return (
                  <tr key={a.id}>
                    <td>
                      <div className={s.u}>
                        <span className={s.uAv}>{initials(a.fullName)}</span>
                        <div><span className={s.uName}>{a.fullName}</span><span className={s.uEmail}>{a.email}</span></div>
                      </div>
                    </td>
                    <td><span className={`${s.pill} ${a.role === 'super_admin' ? s.pillSuper : s.pillAdmin}`}>{a.role === 'super_admin' ? '★ ' : ''}{roleLabel(a.role)}</span></td>
                    <td><span className={`${s.pill} ${a.isActive ? s.pillActive : s.pillInactive}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      {isSelf ? (
                        <div className={s.rowActions}><span className={s.youTag}>You</span></div>
                      ) : (
                        <div className={s.rowActions}>
                          {a.role === 'super_admin' ? (
                            <button className={s.btnSm} disabled={busyId === a.id} onClick={() => patch(a.id, { role: 'admin' })}>Make admin</button>
                          ) : (
                            <button className={s.btnSm} disabled={busyId === a.id} onClick={() => patch(a.id, { role: 'super_admin' })}>Make super admin</button>
                          )}
                          <button className={`${s.btnSm} ${a.isActive ? s.btnDanger : ''}`} disabled={busyId === a.id}
                            onClick={() => patch(a.id, { isActive: !a.isActive })}>
                            {a.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Invite an administrator</h2></div>
        <p className={s.cardDesc}>Send an invitation link. They set their own password when they accept; the account is created with the role you choose.</p>
        <div className={s.inviteRow}>
          <div className={s.field}>
            <label className={s.label} htmlFor="iemail">Email address</label>
            <div className={`${s.inWrap} ${inviteErr ? s.invalid : ''}`}>
              <input id="iemail" type="email" placeholder="new.admin@mbumapropvest.com" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="irole">Role</label>
            <div className={s.selectWrap}>
              <select id="irole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </div>
          </div>
          <button className={`${s.btn} ${s.primary}`} onClick={invite} disabled={inviting || !inviteEmail}>
            {inviting ? 'Inviting…' : 'Invite'}
          </button>
        </div>
        {inviteErr && <span className={s.err}>{inviteErr}</span>}
        {inviteLink && (
          <div className={s.linkBox}>
            <code>{inviteLink}</code>
            <button className={s.btnSm} onClick={() => navigator.clipboard?.writeText(inviteLink)}>Copy link</button>
          </div>
        )}
      </div>

      {/* Pending invitations */}
      <div className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Pending invitations</h2></div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Email</th><th>Role</th><th>Expires</th></tr></thead>
            <tbody>
              {invites.length === 0 ? (
                <tr><td colSpan={3}><div className={s.emptyRow}>No pending administrator invitations.</div></td></tr>
              ) : invites.map((iv) => (
                <tr key={iv.id}>
                  <td>{iv.email}</td>
                  <td><span className={`${s.pill} ${iv.role === 'super_admin' ? s.pillSuper : s.pillAdmin}`}>{roleLabel(iv.role)}</span></td>
                  <td>{fmtDate(iv.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
