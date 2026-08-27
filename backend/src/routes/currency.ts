import { Router, type Response } from 'express';
import { getSettings, XAF_PER_EUR } from '../lib/settings.js';

const router = Router();

/* ── GET /api/currency ──────────────────────────────────────────────
   PUBLIC. Indicative display rates for converting the ZAR base currency.
   rates are "units of <currency> per 1 ZAR". XAF is derived from the fixed
   EUR peg. Never used for transactions — display only.
──────────────────────────────────────────────────────────────────────── */
router.get('/', async (_req, res: Response) => {
  try {
    const { eurPerZar, ratesUpdatedAt } = await getSettings();
    res.json({
      data: {
        base: 'ZAR',
        rates: {
          ZAR: 1,
          EUR: eurPerZar,
          XAF: eurPerZar * XAF_PER_EUR,
        },
        asOf: ratesUpdatedAt,
      },
    });
  } catch (err) {
    console.error('GET /api/currency error:', err);
    res.status(500).json({ error: 'Failed to load currency rates' });
  }
});

export default router;
