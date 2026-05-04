-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "offerStatus" TEXT,
ADD COLUMN     "offeredSalary" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "currentCTC" TEXT,
ADD COLUMN     "currentEmployer" TEXT,
ADD COLUMN     "currentJobTitle" TEXT,
ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "currentSalary" TEXT,
ADD COLUMN     "dbProficiency" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "exitDate" TIMESTAMP(3),
ADD COLUMN     "expectedCTC" TEXT,
ADD COLUMN     "expectedSalary" TEXT,
ADD COLUMN     "experienceDuration" TEXT,
ADD COLUMN     "experienceType" TEXT,
ADD COLUMN     "experienceYears" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "graduationCollege" TEXT,
ADD COLUMN     "graduationDegree" TEXT,
ADD COLUMN     "graduationPercentage" TEXT,
ADD COLUMN     "graduationYear" TEXT,
ADD COLUMN     "highestQualification" TEXT,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "isDirectHire" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTerminated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinedDate" TIMESTAMP(3),
ADD COLUMN     "joiningStatus" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "noticePeriod" TEXT,
ADD COLUMN     "otherSocial" TEXT,
ADD COLUMN     "ownerId" INTEGER,
ADD COLUMN     "pgCollege" TEXT,
ADD COLUMN     "pgDegree" TEXT,
ADD COLUMN     "pgPercentage" TEXT,
ADD COLUMN     "pgYear" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "prevCompanyName" TEXT,
ADD COLUMN     "prevDesignation" TEXT,
ADD COLUMN     "projectURL" TEXT,
ADD COLUMN     "reasonForChange" TEXT,
ADD COLUMN     "roleDescription" TEXT,
ADD COLUMN     "salutation" TEXT,
ADD COLUMN     "skillSet" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW',
ADD COLUMN     "technologies" TEXT,
ADD COLUMN     "tenthPercentage" TEXT,
ADD COLUMN     "tenthYear" TEXT,
ADD COLUMN     "twelfthPercentage" TEXT,
ADD COLUMN     "twelfthYear" TEXT,
ADD COLUMN     "whyFit" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "evaluation" JSONB,
ADD COLUMN     "interviewer" TEXT,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "assignedRecruiter" TEXT,
ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "hiringManager" TEXT,
ADD COLUMN     "interviewMode" TEXT,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "numPositions" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "postedBy" TEXT,
ADD COLUMN     "requiredSkills" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "salaryRange" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "alias" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "notificationSettings" JSONB,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "primaryContact" TEXT,
    "description" TEXT,
    "alias" TEXT,
    "landline" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "departments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feedbackSchema" JSONB,
    "portalSettings" JSONB,
    "parserSettings" JSONB,
    "resumeInboxSettings" JSONB,
    "modulesConfig" JSONB,
    "templatesConfig" JSONB,
    "dashboardConfig" JSONB,
    "automationConfig" JSONB,
    "developerSettings" JSONB,
    "formConfig" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "institute" TEXT NOT NULL,
    "major" TEXT,
    "degree" TEXT NOT NULL,
    "fromMonth" TEXT,
    "fromYear" TEXT,
    "toMonth" TEXT,
    "toYear" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "summary" TEXT,
    "fromMonth" TEXT,
    "fromYear" TEXT,
    "toMonth" TEXT,
    "toYear" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "applicationId" INTEGER,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "userId" INTEGER,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalkInCampaign" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "profile" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalkInCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalkInRegistration" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "currentLocation" TEXT,
    "hometown" TEXT,
    "source" TEXT,
    "profile" TEXT,
    "tenthPercentage" TEXT,
    "tenthYear" TEXT,
    "twelfthPercentage" TEXT,
    "twelfthYear" TEXT,
    "graduationDegree" TEXT,
    "graduationYear" TEXT,
    "graduationPercentage" TEXT,
    "graduationCollege" TEXT,
    "pgDegree" TEXT,
    "pgYear" TEXT,
    "pgPercentage" TEXT,
    "pgCollege" TEXT,
    "experienceType" TEXT,
    "experienceDuration" TEXT,
    "roleDescription" TEXT,
    "prevCompanyName" TEXT,
    "prevDesignation" TEXT,
    "currentCTC" TEXT,
    "expectedCTC" TEXT,
    "noticePeriod" TEXT,
    "reasonForChange" TEXT,
    "projectURL" TEXT,
    "technologies" TEXT,
    "dbProficiency" INTEGER NOT NULL DEFAULT 0,
    "resumeUrl" TEXT,
    "photoUrl" TEXT,
    "certificateUrl" TEXT,
    "whyFit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "aptitudePaperSet" TEXT,
    "aptitudeMarks" INTEGER NOT NULL DEFAULT 0,
    "techMarks" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "isShortlistedAptitude" BOOLEAN NOT NULL DEFAULT false,
    "candidateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalkInRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalkInRound" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "roundType" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'HOLD',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalkInRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperTracking" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "aptitudePaper" TEXT,
    "codingPaper" TEXT,
    "dbPaper" TEXT,
    "projectTask" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaperTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaperTracking_registrationId_key" ON "PaperTracking"("registrationId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkInRegistration" ADD CONSTRAINT "WalkInRegistration_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "WalkInCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkInRound" ADD CONSTRAINT "WalkInRound_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "WalkInRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTracking" ADD CONSTRAINT "PaperTracking_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "WalkInRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
