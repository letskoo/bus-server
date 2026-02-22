-- CreateEnum
CREATE TYPE "RouteScheduleType" AS ENUM ('PICKUP', 'DROPOFF');

-- CreateTable
CREATE TABLE "DriverSession" (
    "token" TEXT NOT NULL,
    "driverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverSession_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "RouteSchedule" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "type" "RouteScheduleType" NOT NULL,
    "startTime" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverSession_driverId_expiresAt_idx" ON "DriverSession"("driverId", "expiresAt");

-- CreateIndex
CREATE INDEX "RouteSchedule_routeId_type_startTime_idx" ON "RouteSchedule"("routeId", "type", "startTime");

-- CreateIndex
CREATE INDEX "Driver_phone_idx" ON "Driver"("phone");

-- AddForeignKey
ALTER TABLE "DriverSession" ADD CONSTRAINT "DriverSession_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteSchedule" ADD CONSTRAINT "RouteSchedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
