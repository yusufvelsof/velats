-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "aptitudeMarks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aptitudePaperSet" TEXT,
ADD COLUMN     "techMarks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMarks" INTEGER NOT NULL DEFAULT 0;
