-- CreateTable
CREATE TABLE "SlotBooking" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SlotBooking" ADD CONSTRAINT "SlotBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
