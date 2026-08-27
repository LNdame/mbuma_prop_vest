'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CURRENCIES, IDENTITY_RATES, formatMoney, isCurrencyCode, type CurrencyCode, type Rates } from './currency';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const STORAGE_KEY = 'displayCurrency';

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Rates;
  asOf: string | null;
  ready: boolean;
  isBase: boolean;
  /** Format a ZAR amount in the current display currency. */
  format: (amountZar: number | string | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('ZAR');
  const [rates, setRates] = useState<Rates>(IDENTITY_RATES);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/currency`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.data?.rates) { setRates(j.data.rates as Rates); setAsOf(j.data.asOf ?? null); }
        // Apply the saved preference only after rates are in, so we never render a
        // non-base currency with a zero rate.
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isCurrencyCode(saved)) setCurrencyState(saved);
      })
      .catch(() => { /* keep ZAR base */ })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  }

  const value: CurrencyState = {
    currency,
    setCurrency,
    rates,
    asOf,
    ready,
    isBase: currency === 'ZAR',
    format: (amountZar) => formatMoney(amountZar, currency, rates),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyState {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback for any tree not wrapped in the provider: base ZAR, no conversion.
    return {
      currency: 'ZAR', setCurrency: () => {}, rates: IDENTITY_RATES, asOf: null, ready: true, isBase: true,
      format: (a) => formatMoney(a, 'ZAR', IDENTITY_RATES),
    };
  }
  return ctx;
}

export { CURRENCIES };
