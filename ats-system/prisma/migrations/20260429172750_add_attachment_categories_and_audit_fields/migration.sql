/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "uploadedAt",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedById" INTEGER,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedById" INTEGER;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "attachmentCategories" TEXT[] DEFAULT ARRAY['Resume', 'Cover Letter', 'Others', 'Offer', 'Contracts', 'Solutions R1', 'Solutions R2', 'Solutions R3', 'Solutions R4', 'Evaluation Sheet']::TEXT[];

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
