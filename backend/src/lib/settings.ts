import { prisma } from './prisma.js';

/**
 * Platform settings accessor. Values live in the single `settings` row (id = 1)
 * and used to be hardcoded across the backend. Read via `getSettings()` — the
 * result is cached in-process and refreshed with `invalidateSettings()` whenever
 * the row is updated (see routes/settings.ts).
 */

export interface PlatformSettings {
  withholdingTaxRate: number;   // fraction, e.g. 0.15 = 15%
  invitationExpiryDays: number;
  sessionHours: number;
  defaultMinPledge: number;
  supportEmail: string | null;
  publicSiteUrl: string | null;
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
      }
    : DEFAULT_SETTINGS;
  return cache;
}

/** Clear the in-process cache so the next getSettings() re-reads the row. */
export function invalidateSettings(): void {
  cache = null;
}
