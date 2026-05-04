-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "candidateSources" TEXT[] DEFAULT ARRAY['Job Portal', 'LinkedIn', 'Referral', 'Walk-in', 'Career Site']::TEXT[],
ADD COLUMN     "candidateStatuses" TEXT[] DEFAULT ARRAY['NEW', 'SHORTLISTED', 'REJECTED', 'HIRED']::TEXT[],
ALTER COLUMN "departments" SET DEFAULT ARRAY['Engineering', 'Sales', 'Marketing', 'HR', 'Operations']::TEXT[],
ALTER COLUMN "technologies" SET DEFAULT ARRAY['React', 'Node.js', 'Python', 'Java', 'AWS']::TEXT[],
ALTER COLUMN "interviewLevels" SET DEFAULT ARRAY['TECH_1', 'TECH_2', 'HR', 'MANAGERIAL']::TEXT[];
