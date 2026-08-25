-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "withholding_tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.15,
    "invitation_expiry_days" INTEGER NOT NULL DEFAULT 7,
    "session_hours" INTEGER NOT NULL DEFAULT 24,
    "default_min_pledge" DECIMAL(14,2) NOT NULL DEFAULT 1000,
    "support_email" TEXT,
    "public_site_url" TEXT,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
    -- Enforce a single configuration row.
    CONSTRAINT "settings_singleton" CHECK ("id" = 1)
);

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the singleton row with the built-in defaults (mirrors the values that
-- were previously hardcoded in the backend).
INSERT INTO "settings" ("id") VALUES (1);
