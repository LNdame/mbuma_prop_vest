'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import s from './RunDistributionModal.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface PropertyOption {
  id: string;
  title: string;
  netMonthlyRent: string;
  investorCount: number;
}

interface Props {
  properties: PropertyOption[];
}

function currentPeriodLabel() {
  const now = new Date();
  return now.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

export default function RunDistributionModal({ properties }: Props) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [open, setOpen]           = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [periodLabel, setPeriodLabel] = useState(currentPeriodLabel());
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes]         = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const selectedProp = properties.find((p) => p.id === propertyId);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) setOpen(false);
  }

  function reset() {
    setPropertyId('');
    setPeriodLabel(currentPeriodLabel());
    setTotalAmount('');
    setNotes('');
    setError('');
  }

  function openModal() { reset(); setOpen(true); }
  function closeModal() { setOpen(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!propertyId) { setError('Please select a property.'); return; }
    if (!periodLabel.trim()) { setError('Period label is required.'); return; }
    const amount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amount) || amount <= 0) {
      setError('Enter a valid total net rental income amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/distributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({
          propertyId,
          periodLabel: periodLabel.trim(),
          totalAmount: amount,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Something went wrong.'); return; }
      closeModal();
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className={s.btnPrimary} onClick={openModal}>
        Run distribution →
      </button>

      {open && (
        <div className={s.overlay} ref={overlayRef} onClick={handleOverlayClick}>
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="dist-modal-title">

            <div className={s.modalHead}>
              <div>
                <h2 className={s.modalTitle} id="dist-modal-title">Run Distribution</h2>
                <p className={s.modalSub}>Distribute net rental income to investors proportionally by pledge</p>
              </div>
              <button className={s.closeBtn} onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>

              {/* Property */}
              <div className={s.field}>
                <label className={s.label} htmlFor="dist-property">Property</label>
                <select
                  id="dist-property"
                  className={`${s.select} ${!propertyId && error ? s.inputError : ''}`}
                  value={propertyId}
                  onChange={(e) => { setPropertyId(e.target.value); setError(''); }}
                >
                  <option value="">— Select a property —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.investorCount} investor{p.investorCount !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
                {selectedProp && (
                  <p className={s.hint}>
                    Monthly net rent: <strong>R{Number(selectedProp.netMonthlyRent).toLocaleString('en-ZA')}</strong>
                  </p>
                )}
              </div>

              {/* Period label */}
              <div className={s.field}>
                <label className={s.label} htmlFor="dist-period">Period label</label>
                <input
                  id="dist-period"
                  type="text"
                  className={s.input}
                  placeholder="e.g. June 2026"
                  value={periodLabel}
                  onChange={(e) => { setPeriodLabel(e.target.value); setError(''); }}
                />
                <p className={s.hint}>Shown to investors on their distribution history.</p>
              </div>

              {/* Total amount */}
              <div className={s.field}>
                <label className={s.label} htmlFor="dist-amount">Total net rental income (ZAR)</label>
                <div className={s.inputPrefix}>
                  <span className={s.prefix}>R</span>
                  <input
                    id="dist-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    className={`${s.input} ${s.inputWithPrefix}`}
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => { setTotalAmount(e.target.value); setError(''); }}
                  />
                </div>
                <p className={s.hint}>Amount to be split pro-rata across investors by pledge value. Withholding tax (15%) will be deducted per line.</p>
              </div>

              {/* Notes */}
              <div className={s.field}>
                <label className={s.label} htmlFor="dist-notes">
                  Notes <span className={s.optional}>(optional)</span>
                </label>
                <textarea
                  id="dist-notes"
                  className={s.textarea}
                  rows={3}
                  placeholder="Internal notes for this distribution run…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Summary preview */}
              {selectedProp && totalAmount && !isNaN(parseFloat(totalAmount)) && parseFloat(totalAmount) > 0 && (
                <div className={s.preview}>
                  <div className={s.previewTitle}>Preview</div>
                  <div className={s.previewRow}>
                    <span>Gross per investor</span>
                    <span>Pro-rata share of R{Number(parseFloat(totalAmount)).toLocaleString('en-ZA')}</span>
                  </div>
                  <div className={s.previewRow}>
                    <span>Withholding tax</span>
                    <span>15% deducted per line</span>
                  </div>
                  <div className={s.previewRow}>
                    <span>Recipients</span>
                    <span>{selectedProp.investorCount} investor{selectedProp.investorCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {error && <p className={s.errorMsg}>{error}</p>}

              <div className={s.actions}>
                <button type="button" className={s.btnCancel} onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className={s.btnSubmit} disabled={loading}>
                  {loading ? 'Creating…' : 'Create distribution'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
