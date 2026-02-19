-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "DriverConsentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'DRIVER_SHARE_DISABLED';

-- DropForeignKey
ALTER TABLE "NotificationLog" DROP CONSTRAINT "NotificationLog_organizationId_fkey";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "status" "DriverStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "NotificationLog" ALTER COLUMN "channel" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "ownerPhone" TEXT;

-- CreateTable
CREATE TABLE "DriverConsent" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "status" "DriverConsentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "DriverConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverConsent_token_key" ON "DriverConsent"("token");

-- CreateIndex
CREATE INDEX "DriverConsent_organizationId_createdAt_idx" ON "DriverConsent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "DriverConsent_driverId_createdAt_idx" ON "DriverConsent"("driverId", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverConsent" ADD CONSTRAINT "DriverConsent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverConsent" ADD CONSTRAINT "DriverConsent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
