/*
  Warnings:

  - The primary key for the `ShareToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ShareToken` table. All the data in the column will be lost.
  - You are about to drop the column `tripId` on the `ShareToken` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `DriverAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointLedger` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ShareToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BoardingMode" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('ALIMTALK', 'SMS');

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "DriverAssignment" DROP CONSTRAINT "DriverAssignment_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverAssignment" DROP CONSTRAINT "DriverAssignment_routeId_fkey";

-- DropForeignKey
ALTER TABLE "PointLedger" DROP CONSTRAINT "PointLedger_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ShareToken" DROP CONSTRAINT "ShareToken_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropIndex
DROP INDEX "Driver_organizationId_isActive_idx";

-- DropIndex
DROP INDEX "ShareToken_expiresAt_idx";

-- DropIndex
DROP INDEX "ShareToken_routeId_createdAt_idx";

-- DropIndex
DROP INDEX "ShareToken_token_key";

-- AlterTable
ALTER TABLE "BoardingLog" ADD COLUMN     "mode" "BoardingMode" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NotificationLog" ADD COLUMN     "channel" "NotificationChannel" NOT NULL,
ADD COLUMN     "costPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "routeId" INTEGER,
ADD COLUMN     "stopId" INTEGER;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "driverId" INTEGER;

-- AlterTable
ALTER TABLE "ShareToken" DROP CONSTRAINT "ShareToken_pkey",
DROP COLUMN "id",
DROP COLUMN "tripId",
ADD COLUMN     "driverId" INTEGER,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD CONSTRAINT "ShareToken_pkey" PRIMARY KEY ("token");

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "driverId";

-- DropTable
DROP TABLE "DriverAssignment";

-- DropTable
DROP TABLE "PointLedger";

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointTransaction_organizationId_createdAt_idx" ON "PointTransaction"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_organizationId_createdAt_idx" ON "NotificationLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_phone_createdAt_idx" ON "NotificationLog"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "Route_organizationId_idx" ON "Route"("organizationId");

-- CreateIndex
CREATE INDEX "Route_busId_idx" ON "Route"("busId");

-- CreateIndex
CREATE INDEX "Route_driverId_idx" ON "Route"("driverId");

-- CreateIndex
CREATE INDEX "ShareToken_routeId_expiresAt_idx" ON "ShareToken"("routeId", "expiresAt");

-- CreateIndex
CREATE INDEX "ShareToken_organizationId_expiresAt_idx" ON "ShareToken"("organizationId", "expiresAt");

-- CreateIndex
CREATE INDEX "Stop_routeId_orderNo_idx" ON "Stop"("routeId", "orderNo");

-- CreateIndex
CREATE INDEX "Student_organizationId_idx" ON "Student"("organizationId");

-- CreateIndex
CREATE INDEX "Student_stopId_idx" ON "Student"("stopId");

-- CreateIndex
CREATE INDEX "Trip_routeId_status_startedAt_idx" ON "Trip"("routeId", "status", "startedAt");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareToken" ADD CONSTRAINT "ShareToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareToken" ADD CONSTRAINT "ShareToken_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
