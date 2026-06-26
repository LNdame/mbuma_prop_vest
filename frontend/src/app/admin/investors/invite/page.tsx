'use client';

import { useState, useEffect } from 'react';
import s from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Step = 'form' | 'success';

export default function InviteInvestorPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<Step>('form');
  const [result, setResult]   = useState<{ email: string; inviteLink: string; expiresAt: string } | null>(null);

  // Prefill the email when arriving from a dashboard "Invitation request" action.
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get('email');
    if (prefill) setEmail(prefill);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Something went wrong'); return; }
      setResult(json.data);
      setStep('success');
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (result?.inviteLink) navigator.clipboard.writeText(result.inviteLink);
  }

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Invite investor</h1>
          <p className={s.pageSub}>Send a secure invitation link to a new investor</p>
        </div>
        <a href="/admin/investors" className={s.backLink}>← Back to investors</a>
      </div>

      <div className={s.card}>
        {step === 'form' ? (
          <>
            <div className={s.cardHead}>
              <div className={s.cardIcon}>👤</div>
              <div>
                <div className={s.cardTitle}>New invitation</div>
                <div className={s.cardSub}>The investor will receive a link to complete registration and KYC</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              <label className={s.label} htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className={`${s.input} ${error ? s.inputError : ''}`}
                placeholder="investor@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoFocus
              />
              {error && <div className={s.errorMsg}>{error}</div>}

              <div className={s.infoBox}>
                <div className={s.infoRow}>
                  <span className={s.infoIcon}>🔒</span>
                  <span>Invitation link expires after <strong>7 days</strong></span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoIcon}>✓</span>
                  <span>Investor must complete FICA/KYC before pledging</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoIcon}>📧</span>
                  <span>Copy the generated link to share via email or WhatsApp</span>
                </div>
              </div>

              <div className={s.formActions}>
                <a href="/admin/investors" className={s.btnCancel}>Cancel</a>
                <button type="submit" className={s.btnPrimary} disabled={loading}>
                  {loading ? 'Sending…' : 'Generate invitation →'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={s.successWrap}>
            <div className={s.successIcon}>✅</div>
            <div className={s.successTitle}>Invitation created</div>
            <div className={s.successSub}>
              Share the link below with <strong>{result?.email}</strong>. It expires on{' '}
              {result?.expiresAt ? new Date(result.expiresAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}.
            </div>

            <div className={s.linkBox}>
              <span className={s.linkText}>{result?.inviteLink}</span>
              <button className={s.btnCopy} onClick={copyLink}>Copy</button>
            </div>

            <div className={s.successActions}>
              <button
                className={s.btnOutline}
                onClick={() => { setStep('form'); setEmail(''); setResult(null); }}
              >
                Invite another
              </button>
              <a href="/admin/investors" className={s.btnPrimary}>Back to investors</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
