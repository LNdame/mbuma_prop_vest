'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function fmtRand(n: number | string | null) {
  const v = Number(n);
  if (!v) return 'R0';
  return 'R' + v.toLocaleString('en-ZA');
}

interface Props {
  propertyId: string;
  status: 'draft' | 'open' | 'funded' | 'closed';
  minimumPledge: string;
  projectedYieldPct: string;
  targetRaise: string;
  fundedAmount: string;
}

export default function PledgePanel({
  propertyId,
  status,
  minimumPledge,
  projectedYieldPct,
  targetRaise,
  fundedAmount,
}: Props) {
  const router = useRouter();
  const isOpen = status === 'open';

  const minPledge = Number(minimumPledge);
  const remaining = Math.max(0, Number(targetRaise) - Number(fundedAmount));
  const yieldPct  = Number(projectedYieldPct).toFixed(1);

  const [modalOpen, setModalOpen]   = useState(false);
  const [amount, setAmount]         = useState(String(minPledge || ''));
  const [available, setAvailable]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);

  // Load the investor's available funds when the modal opens.
  useEffect(() => {
    if (!modalOpen) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setError('Please log in to pledge.'); return; }
    let cancelled = false;
    fetch(`${API}/api/investors/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setAvailable(Number(j?.data?.availableFunds ?? 0)); })
      .catch(() => { if (!cancelled) setAvailable(null); });
    return () => { cancelled = true; };
  }, [modalOpen]);

  function openModal() {
    setError(null);
    setSuccess(false);
    setAmount(String(minPledge || ''));
    setModalOpen(true);
  }

  const amt = Number(amount);
  const validationError =
    !Number.isFinite(amt) || amt <= 0      ? 'Enter a valid amount'
    : amt < minPledge                       ? `Minimum pledge is ${fmtRand(minPledge)}`
    : amt > remaining                       ? `Only ${fmtRand(remaining)} remaining`
    : available !== null && amt > available ? `Exceeds your available funds (${fmtRand(available)})`
    : null;

  async function submit() {
    if (validationError) { setError(validationError); return; }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setError('Please log in to pledge.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/properties/${propertyId}/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `Pledge failed (${res.status})`);
      setSuccess(true);
      setAvailable(Number(body?.data?.availableFunds ?? available));
      router.refresh(); // refresh funding progress / investor count
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={s.ctaCard}>
        <div className={s.ctaTitle}>Invest in this property</div>
        <div className={s.ctaSub}>
          Pledge your share and start earning a projected {yieldPct}% yield.
        </div>
        <div className={s.ctaRow}>
          <span className={s.ctaLabel}>Minimum pledge</span>
          <span className={s.ctaValue}>{fmtRand(minPledge)}</span>
        </div>
        <div className={s.ctaRow}>
          <span className={s.ctaLabel}>Projected yield</span>
          <span className={s.ctaValue}>{yieldPct}%</span>
        </div>
        <button
          type="button"
          className={`${s.btnPledge} ${isOpen ? '' : s.btnDisabled}`}
          disabled={!isOpen}
          onClick={openModal}
        >
          {isOpen ? 'Pledge Now →' : status === 'funded' ? 'Fully funded' : 'Not open for pledges'}
        </button>
      </div>

      {modalOpen && (
        <div className={s.modalOverlay} onClick={() => !submitting && setModalOpen(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            {success ? (
              <>
                <div className={s.modalTitle}>Pledge submitted 🎉</div>
                <p className={s.modalSub}>
                  Your pledge of <strong>{fmtRand(amt)}</strong> is now pending. We&apos;ll confirm it
                  shortly — you can track its status on your dashboard.
                </p>
                <div className={s.modalRow}>
                  <span className={s.ctaLabel}>Remaining available funds</span>
                  <span className={s.ctaValue}>{fmtRand(available)}</span>
                </div>
                <button type="button" className={s.btnPledge} onClick={() => setModalOpen(false)}>
                  Done
                </button>
              </>
            ) : (
              <>
                <div className={s.modalTitle}>Pledge to this property</div>
                <p className={s.modalSub}>
                  Your pledge reserves funds from your available balance and starts as pending
                  until confirmed.
                </p>

                <div className={s.modalMeta}>
                  <div className={s.modalRow}>
                    <span className={s.ctaLabel}>Available funds</span>
                    <span className={s.ctaValue}>
                      {available === null ? '—' : fmtRand(available)}
                    </span>
                  </div>
                  <div className={s.modalRow}>
                    <span className={s.ctaLabel}>Minimum pledge</span>
                    <span className={s.ctaValue}>{fmtRand(minPledge)}</span>
                  </div>
                  <div className={s.modalRow}>
                    <span className={s.ctaLabel}>Remaining on raise</span>
                    <span className={s.ctaValue}>{fmtRand(remaining)}</span>
                  </div>
                </div>

                <label className={s.modalLabel} htmlFor="pledgeAmount">Pledge amount (R)</label>
                <input
                  id="pledgeAmount"
                  className={s.modalInput}
                  type="number"
                  min={minPledge}
                  step="100"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(null); }}
                  disabled={submitting}
                />

                {(error || (validationError && amount !== '')) && (
                  <div className={s.modalError}>{error ?? validationError}</div>
                )}

                <div className={s.modalActions}>
                  <button
                    type="button"
                    className={s.btnSecondary}
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${s.btnPledge} ${(submitting || !!validationError) ? s.btnDisabled : ''}`}
                    onClick={submit}
                    disabled={submitting || !!validationError}
                  >
                    {submitting ? 'Submitting…' : `Pledge ${fmtRand(amt)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
