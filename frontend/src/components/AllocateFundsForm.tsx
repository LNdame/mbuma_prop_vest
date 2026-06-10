'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const input: CSSProperties = {
  width: '100%', boxSizing: 'border-box', fontSize: 13, padding: '9px 11px',
  border: '1px solid var(--neutral-200)', borderRadius: 8, background: 'var(--white)', color: 'var(--neutral-900)',
};
const label: CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4, display: 'block' };

export default function AllocateFundsForm({ investorId }: { investorId: string }) {
  const router = useRouter();
  const [amount, setAmount]       = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote]           = useState('');
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState('');
  const [okMsg, setOkMsg]         = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setOkMsg('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a positive amount.'); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/investors/${investorId}/allocate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body:    JSON.stringify({ amount: amt, reference: reference.trim() || undefined, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Could not allocate funds.'); return; }
      setOkMsg(`Allocated · new balance R${Number(data.data.availableFunds).toLocaleString('en-ZA')}`);
      setAmount(''); setReference(''); setNote('');
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={label}>Amount received (ZAR)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>R</span>
          <input style={input} type="number" min="0" step="100" inputMode="decimal" placeholder="0"
                 value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
        </div>
      </div>
      <div>
        <label style={label}>Bank reference <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
        <input style={input} type="text" placeholder="e.g. FNB 8842 / EFT ref"
               value={reference} onChange={(e) => setReference(e.target.value)} disabled={busy} />
      </div>
      <div>
        <label style={label}>Note <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
        <input style={input} type="text" placeholder="Internal note"
               value={note} onChange={(e) => setNote(e.target.value)} disabled={busy} />
      </div>

      {error && <div style={{ fontSize: 12, color: '#b42318' }}>{error}</div>}
      {okMsg && <div style={{ fontSize: 12, color: 'var(--green-700, #15803d)', fontWeight: 600 }}>✓ {okMsg}</div>}

      <button type="submit" disabled={busy}
              style={{ background: 'var(--green-500)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Allocating…' : 'Allocate funds'}
      </button>
    </form>
  );
}
