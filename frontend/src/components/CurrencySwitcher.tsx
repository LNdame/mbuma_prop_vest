'use client';

import { useCurrency, CURRENCIES } from '@/lib/CurrencyContext';
import { CURRENCY_CODES, type CurrencyCode } from '@/lib/currency';
import s from './CurrencySwitcher.module.css';

/**
 * Lets the viewer pick a display currency. Base is ZAR; EUR/XAF are indicative
 * conversions (display only — pledges are always in ZAR).
 */
export default function CurrencySwitcher() {
  const { currency, setCurrency, isBase, asOf } = useCurrency();

  const note = isBase
    ? 'Amounts shown in South African Rand.'
    : `Indicative conversion${asOf ? ` · rate updated ${new Date(asOf).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Pledges are made in ZAR.`;

  return (
    <div className={s.wrap}>
      <span className={s.icon} aria-hidden>⇄</span>
      <label className={s.srOnly} htmlFor="currency-select">Display currency</label>
      <select
        id="currency-select"
        className={s.select}
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        title={note}
      >
        {CURRENCY_CODES.map((code) => (
          <option key={code} value={code}>{CURRENCIES[code].label}</option>
        ))}
      </select>
      {!isBase && <span className={s.badge} title={note}>≈ indicative</span>}
    </div>
  );
}
