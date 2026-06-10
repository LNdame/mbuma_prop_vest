-- CreateEnum
CREATE TYPE "InvitationRequestStatus" AS ENUM ('pending', 'invited', 'declined');

-- CreateTable
CREATE TABLE "invitation_requests" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "status" "InvitationRequestStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitation_requests_email_idx" ON "invitation_requests"("email");
