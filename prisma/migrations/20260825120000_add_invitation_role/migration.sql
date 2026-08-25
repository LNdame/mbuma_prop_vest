-- Invitations carry the role the accepted account will be created with.
-- Existing rows keep the previous behaviour (investor).
ALTER TABLE "invitations" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'investor';
