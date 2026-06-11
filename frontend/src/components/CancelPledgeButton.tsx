'use client';

import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const btn: CSSProperties = {
  fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
  border: '1px solid #fecdca', background: '#fef3f2', color: '#b42318', cursor: 'pointer',
};
const btnDisabled: CSSProperties = {
  ...btn, border: '1px solid var(--neutral-200)', background: 'var(--white)',
  color: 'var(--neutral-400, #9ca3af)', cursor: 'not-allowed',
};

interface Props {
  pledgeId: string;
  /** Whether the pledge is cancellable (pending + property still open). */
  canCancel: boolean;
  /** Tooltip explaining why it's disabled, when canCancel is false. */
  disabledReason?: string;
  /** 'reload' for client-data pages (useMe), 'router' for SSR pages. */
  refreshMode?: 'reload' | 'router';
}

export default function CancelPledgeButton({ pledgeId, canCancel, disabledReason, refreshMode = 'router' }: Props) {
  const router = useRouter();
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    if (!canCancel || busy) return;
    if (!window.confirm('Cancel this pledge? This releases the funds it reserved.')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/pledges/${pledgeId}/cancel`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Could not cancel pledge.'); return; }
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
      <button
        type="button"
        onClick={cancel}
        disabled={!canCancel || busy}
        title={!canCancel ? disabledReason : undefined}
        style={canCancel ? btn : btnDisabled}
      >
        {busy ? 'Cancelling…' : 'Cancel'}
      </button>
      {error && <span style={{ fontSize: 11, color: '#b42318', maxWidth: 180, textAlign: 'right' }}>{error}</span>}
    </span>
  );
}
