/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `SlotBooking` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `SlotBooking` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "SlotBooking" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SlotBooking_token_key" ON "SlotBooking"("token");
