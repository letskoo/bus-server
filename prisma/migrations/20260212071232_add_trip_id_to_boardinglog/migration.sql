-- AlterTable
ALTER TABLE "BoardingLog" ADD COLUMN     "tripId" INTEGER;

-- CreateIndex
CREATE INDEX "BoardingLog_routeId_createdAt_idx" ON "BoardingLog"("routeId", "createdAt");

-- CreateIndex
CREATE INDEX "BoardingLog_tripId_stopId_createdAt_idx" ON "BoardingLog"("tripId", "stopId", "createdAt");

-- CreateIndex
CREATE INDEX "BoardingLog_studentId_tripId_idx" ON "BoardingLog"("studentId", "tripId");

-- AddForeignKey
ALTER TABLE "BoardingLog" ADD CONSTRAINT "BoardingLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
