-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "addSignature" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "module" TEXT DEFAULT 'INTERVIEW',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "EmailTemplateHistory" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "defaultFromEmail" TEXT,
    "addSignature" BOOLEAN NOT NULL,
    "attachments" JSONB,
    "reason" TEXT,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTemplateHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailTemplateHistory" ADD CONSTRAINT "EmailTemplateHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
