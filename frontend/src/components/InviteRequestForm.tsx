'use client';

import { useState, type FormEvent } from 'react';
import s from '../app/page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function InviteRequestForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API}/api/invitations/request`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className={s.ctaSuccess}>
        <span className={s.ctaSuccessIcon}>✓</span>
        <div>
          <div className={s.ctaSuccessTitle}>You&apos;re on the list</div>
          <div className={s.ctaSuccessSub}>We&apos;ll email you when a spot opens up.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className={s.ctaForm} onSubmit={submit} noValidate>
        <input
          className={s.ctaInput}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
        />
        <button className={s.btnCtaSubmit} type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting…' : 'Request Invitation'}
        </button>
      </form>
      <p className={s.ctaNote}>
        {error
          ? <span style={{ color: '#fca5a5' }}>{error}</span>
          : 'No spam. We’ll only contact you with your invitation link.'}
      </p>
    </>
  );
}
