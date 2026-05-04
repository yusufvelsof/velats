/*
  Warnings:

  - A unique constraint covering the columns `[driveId,email]` on the table `SlotBooking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[driveId,mobile]` on the table `SlotBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SlotBooking" ADD COLUMN     "driveId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "SlotBooking_driveId_email_key" ON "SlotBooking"("driveId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SlotBooking_driveId_mobile_key" ON "SlotBooking"("driveId", "mobile");
