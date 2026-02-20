/*
  Warnings:

  - The primary key for the `DriverConsent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DriverConsent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DriverConsent_token_key";

-- AlterTable
ALTER TABLE "DriverConsent" DROP CONSTRAINT "DriverConsent_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DriverConsent_pkey" PRIMARY KEY ("token");

-- CreateTable
CREATE TABLE "ChargeRequest" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "depositor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChargeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChargeRequest_organizationId_createdAt_idx" ON "ChargeRequest"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ChargeRequest_status_createdAt_idx" ON "ChargeRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Driver_organizationId_idx" ON "Driver"("organizationId");

-- AddForeignKey
ALTER TABLE "ChargeRequest" ADD CONSTRAINT "ChargeRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
