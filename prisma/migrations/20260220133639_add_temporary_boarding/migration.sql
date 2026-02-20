-- CreateEnum
CREATE TYPE "TemporaryBoardingStatus" AS ENUM ('ACTIVE', 'CANCEL');

-- CreateEnum
CREATE TYPE "TemporaryCreatedBy" AS ENUM ('PARENT', 'DIRECTOR');

-- CreateTable
CREATE TABLE "TemporaryBoarding" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "stopId" INTEGER NOT NULL,
    "studentId" INTEGER,
    "studentName" TEXT NOT NULL,
    "studentPhoneLast4" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "targetTime" TEXT NOT NULL,
    "status" "TemporaryBoardingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" "TemporaryCreatedBy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemporaryBoarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemporaryBoarding_organizationId_targetDate_idx" ON "TemporaryBoarding"("organizationId", "targetDate");

-- CreateIndex
CREATE INDEX "TemporaryBoarding_routeId_targetDate_idx" ON "TemporaryBoarding"("routeId", "targetDate");

-- CreateIndex
CREATE INDEX "TemporaryBoarding_studentId_targetDate_idx" ON "TemporaryBoarding"("studentId", "targetDate");

-- AddForeignKey
ALTER TABLE "TemporaryBoarding" ADD CONSTRAINT "TemporaryBoarding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporaryBoarding" ADD CONSTRAINT "TemporaryBoarding_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporaryBoarding" ADD CONSTRAINT "TemporaryBoarding_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporaryBoarding" ADD CONSTRAINT "TemporaryBoarding_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
