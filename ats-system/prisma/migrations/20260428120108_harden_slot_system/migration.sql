-- AlterTable
ALTER TABLE "Drive" ADD COLUMN     "venueLat" DOUBLE PRECISION,
ADD COLUMN     "venueLng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SlotBooking" ADD COLUMN     "checkInToken" TEXT,
ADD COLUMN     "checkInTokenExpires" TIMESTAMP(3);
