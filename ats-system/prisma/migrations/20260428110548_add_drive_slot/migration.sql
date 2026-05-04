/*
  Warnings:

  - You are about to drop the column `variables` on the `EmailTemplate` table. All the data in the column will be lost.
  - Added the required column `to` to the `EmailLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailLog" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "bcc" TEXT,
ADD COLUMN     "cc" TEXT,
ADD COLUMN     "emailType" TEXT DEFAULT 'custom',
ADD COLUMN     "to" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "variables",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "defaultFromEmail" TEXT;

-- CreateTable
CREATE TABLE "Drive" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "slotType" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL,
    "bufferTime" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" SERIAL NOT NULL,
    "driveId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Drive" ADD CONSTRAINT "Drive_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
