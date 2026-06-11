'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function VerifyInvestorButton({ investorId, className }: { investorId: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  async function verify() {
    if (busy) return;
    if (!window.confirm('Verify this investor? This approves their KYC.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/investors/${investorId}/verify`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Could not verify investor.'); return; }
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <button type="button" className={className} onClick={verify} disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Verifying…' : 'Verify investor'}
      </button>
      {error && <span style={{ fontSize: 11, color: '#b42318', maxWidth: 220, textAlign: 'right' }}>{error}</span>}
    </span>
  );
}
