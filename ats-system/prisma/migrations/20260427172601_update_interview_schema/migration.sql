-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "interviewerId" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ownerId" INTEGER,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "reminder" TEXT,
ADD COLUMN     "subReason" TEXT;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
