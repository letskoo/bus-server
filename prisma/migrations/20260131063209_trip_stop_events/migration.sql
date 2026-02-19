-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('PICKUP', 'DROPOFF');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('RUNNING', 'ENDED');

-- CreateEnum
CREATE TYPE "StopEventType" AS ENUM ('ARRIVE', 'DEPART');

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "busId" INTEGER,
    "type" "TripType" NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "currentStopId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StopEvent" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "stopId" INTEGER NOT NULL,
    "type" "StopEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StopEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StopEvent_tripId_createdAt_idx" ON "StopEvent"("tripId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StopEvent_tripId_stopId_type_key" ON "StopEvent"("tripId", "stopId", "type");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_currentStopId_fkey" FOREIGN KEY ("currentStopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopEvent" ADD CONSTRAINT "StopEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopEvent" ADD CONSTRAINT "StopEvent_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
