'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const btn: CSSProperties = {
  fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
  border: 'none', background: 'var(--green-500)', color: 'var(--white)', cursor: 'pointer',
};

interface Props {
  pledgeId: string;
  /** 'reload' for client-data pages (useMe), 'router' for SSR pages. */
  refreshMode?: 'reload' | 'router';
}

export default function ConfirmPledgeButton({ pledgeId, refreshMode = 'router' }: Props) {
  const router = useRouter();
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (busy) return;
    if (!window.confirm('Confirm this pledge? This marks it as confirmed.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/pledges/${pledgeId}/confirm`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Could not confirm pledge.'); return; }
      if (refreshMode === 'reload') window.location.reload();
      else router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <button type="button" onClick={confirm} disabled={busy} style={{ ...btn, opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Confirming…' : 'Confirm'}
      </button>
      {error && <span style={{ fontSize: 11, color: '#b42318', maxWidth: 180, textAlign: 'right' }}>{error}</span>}
    </span>
  );
}
