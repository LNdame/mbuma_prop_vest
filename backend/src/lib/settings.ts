import { prisma } from './prisma.js';

/**
 * Platform settings accessor. Values live in the single `settings` row (id = 1)
 * and used to be hardcoded across the backend. Read via `getSettings()` — the
 * result is cached in-process and refreshed with `invalidateSettings()` whenever
 * the row is updated (see routes/settings.ts).
 */

/** Fixed peg: 1 EUR = 655.957 XAF (Central African CFA franc). */
export const XAF_PER_EUR = 655.957;

export interface PlatformSettings {
  withholdingTaxRate: number;   // fraction, e.g. 0.15 = 15%
  invitationExpiryDays: number;
  sessionHours: number;
  defaultMinPledge: number;
  supportEmail: string | null;
  publicSiteUrl: string | null;
  eurPerZar: number;            // EUR value of 1 ZAR (admin-managed)
  ratesUpdatedAt: string | null;
}

/** Built-in fallbacks — mirror the @default() values in schema.prisma. Used if
 *  the row is somehow missing (e.g. before the seed migration runs). */
export const DEFAULT_SETTINGS: PlatformSettings = {
  withholdingTaxRate: 0.15,
  invitationExpiryDays: 7,
  sessionHours: 24,
  defaultMinPledge: 1000,
  supportEmail: null,
  publicSiteUrl: null,
  eurPerZar: 0.05,
  ratesUpdatedAt: null,
};

let cache: PlatformSettings | null = null;

export async function getSettings(): Promise<PlatformSettings> {
  if (cache) return cache;
  const row = await prisma.settings.findUnique({ where: { id: 1 } });
  cache = row
    ? {
        withholdingTaxRate: Number(row.withholdingTaxRate),
        invitationExpiryDays: row.invitationExpiryDays,
        sessionHours: row.sessionHours,
        defaultMinPledge: Number(row.defaultMinPledge),
        supportEmail: row.supportEmail,
        publicSiteUrl: row.publicSiteUrl,
        eurPerZar: Number(row.eurPerZar),
        ratesUpdatedAt: row.ratesUpdatedAt ? row.ratesUpdatedAt.toISOString() : null,
      }
    : DEFAULT_SETTINGS;
  return cache;
}

/** Clear the in-process cache so the next getSettings() re-reads the row. */
export function invalidateSettings(): void {
  cache = null;
}
