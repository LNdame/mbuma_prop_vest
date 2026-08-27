/**
 * Multi-currency display helpers. The app's base/functional currency is ZAR —
 * all stored amounts and transactions are in rands. These helpers convert a ZAR
 * amount to a display currency for VIEWING ONLY (indicative). Rates come from
 * GET /api/currency (admin-managed EUR rate; XAF derived from the EUR peg).
 */

export type CurrencyCode = 'ZAR' | 'EUR' | 'XAF';

export interface CurrencyDef {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  decimals: number;
  symbolBefore: boolean;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  ZAR: { code: 'ZAR', symbol: 'R',    label: 'Rand · ZAR',       locale: 'en-ZA', decimals: 0, symbolBefore: true },
  EUR: { code: 'EUR', symbol: '€',    label: 'Euro · EUR',       locale: 'de-DE', decimals: 2, symbolBefore: true },
  XAF: { code: 'XAF', symbol: 'FCFA', label: 'CFA franc · XAF',  locale: 'fr-FR', decimals: 0, symbolBefore: false },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** Units of <code> per 1 ZAR. ZAR is always 1. */
export interface Rates { ZAR: number; EUR: number; XAF: number }

export const IDENTITY_RATES: Rates = { ZAR: 1, EUR: 0, XAF: 0 };

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === 'string' && v in CURRENCIES;
}

export function convertFromZar(amountZar: number, code: CurrencyCode, rates: Rates): number {
  return amountZar * (rates[code] ?? 1);
}

/** Format a ZAR amount in the given display currency. */
export function formatMoney(amountZar: number | string | null | undefined, code: CurrencyCode, rates: Rates): string {
  const zar = typeof amountZar === 'string' ? parseFloat(amountZar) : (amountZar ?? 0);
  const safe = Number.isFinite(zar) ? zar : 0;
  const def = CURRENCIES[code];
  const value = convertFromZar(safe, code, rates);
  const num = value.toLocaleString(def.locale, { minimumFractionDigits: def.decimals, maximumFractionDigits: def.decimals });
  return def.symbolBefore ? `${def.symbol}${num}` : `${num} ${def.symbol}`;
}
