-- Add 'selfie_with_id' KYC document type and 'under_review' KYC status.
ALTER TYPE "DocType" ADD VALUE IF NOT EXISTS 'selfie_with_id';
ALTER TYPE "KycStatus" ADD VALUE IF NOT EXISTS 'under_review';
