-- Multi-currency: admin-managed EUR value of 1 ZAR (base currency stays ZAR).
-- XAF is derived from the fixed EUR peg (1 EUR = 655.957 XAF). Display only.
ALTER TABLE "settings" ADD COLUMN "eur_per_zar" DECIMAL(14,8) NOT NULL DEFAULT 0.05;
ALTER TABLE "settings" ADD COLUMN "rates_updated_at" TIMESTAMP(3);
