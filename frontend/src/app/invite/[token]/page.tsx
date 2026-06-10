'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import s from '../../login/login.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Status = 'loading' | 'valid' | 'invalid';

export default function InviteRegisterPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { token } = params;

  const [status, setStatus]   = useState<Status>('loading');
  const [email, setEmail]     = useState('');
  const [invalidMsg, setInvalidMsg] = useState('');

  const [fullName, setFullName]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [phone, setPhone]         = useState('');
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validate the invite token on mount
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/invitations/${token}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) {
          setInvalidMsg(data.error ?? 'This invitation link is not valid.');
          setStatus('invalid');
          return;
        }
        setEmail(data.data.email);
        setStatus('valid');
      })
      .catch(() => {
        if (!cancelled) {
          setInvalidMsg('Unable to verify this invitation. Please try again.');
          setStatus('invalid');
        }
      });
    return () => { cancelled = true; };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/invitations/${token}/accept`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fullName: fullName.trim(), password, phone: phone.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Could not create your account.'); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/investor/dashboard');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={s.root}>
      {/* Left panel — branding */}
      <div className={s.brand}>
        <div className={s.brandInner}>
          <a href="/" className={s.logo}>
            <div className={s.logoMark}>M</div>
            <span className={s.logoText}>Mbuma <span>PropVest</span></span>
          </a>
          <div className={s.brandBody}>
            <h1 className={s.brandH1}>You&apos;re invited.<br />Create your account.</h1>
            <p className={s.brandSub}>
              Join Mbuma PropVest and start co-owning curated South African
              property — with monthly distributions from R1&nbsp;000.
            </p>
          </div>
          <div className={s.brandStats}>
            <div className={s.stat}><div className={s.statVal}>9.4%</div><div className={s.statLbl}>Avg net yield</div></div>
            <div className={s.statDivider} />
            <div className={s.stat}><div className={s.statVal}>R1 000</div><div className={s.statLbl}>Min. pledge</div></div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={s.panel}>
        <div className={s.formWrap}>

          {status === 'loading' && (
            <p className={s.subheading}>Verifying your invitation…</p>
          )}

          {status === 'invalid' && (
            <>
              <h2 className={s.heading}>Invitation unavailable</h2>
              <p className={s.subheading}>{invalidMsg}</p>
              <div className={s.errorBanner} role="alert">{invalidMsg}</div>
              <p className={s.subheading} style={{ marginTop: 16 }}>
                <a href="/#about" className={s.link}>Request a new invitation →</a>
              </p>
            </>
          )}

          {status === 'valid' && (
            <>
              <h2 className={s.heading}>Create your account</h2>
              <p className={s.subheading}>
                Already have an account?{' '}
                <a href="/login" className={s.link}>Sign in →</a>
              </p>

              <form onSubmit={handleSubmit} className={s.form} noValidate>
                <div className={s.field}>
                  <label htmlFor="fullName" className={s.label}>Full name</label>
                  <input id="fullName" type="text" autoComplete="name" required value={fullName}
                         onChange={(e) => setFullName(e.target.value)} className={s.input} placeholder="Your full name" />
                </div>

                <div className={s.field}>
                  <label htmlFor="email" className={s.label}>Email address</label>
                  <input id="email" type="email" value={email} readOnly disabled
                         className={s.input} style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>

                <div className={s.field}>
                  <label htmlFor="phone" className={s.label}>Phone number <span style={{ opacity: 0.6 }}>(optional)</span></label>
                  <input id="phone" type="tel" autoComplete="tel" value={phone}
                         onChange={(e) => setPhone(e.target.value)} className={s.input} placeholder="+27 …" />
                </div>

                <div className={s.field}>
                  <label htmlFor="password" className={s.label}>Password</label>
                  <input id="password" type="password" autoComplete="new-password" required value={password}
                         onChange={(e) => setPassword(e.target.value)} className={s.input} placeholder="At least 8 characters" />
                </div>

                <div className={s.field}>
                  <label htmlFor="confirm" className={s.label}>Confirm password</label>
                  <input id="confirm" type="password" autoComplete="new-password" required value={confirm}
                         onChange={(e) => setConfirm(e.target.value)} className={s.input} placeholder="Re-enter your password" />
                </div>

                {error && <div className={s.errorBanner} role="alert">{error}</div>}

                <button type="submit" className={s.submitBtn} disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create account →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
