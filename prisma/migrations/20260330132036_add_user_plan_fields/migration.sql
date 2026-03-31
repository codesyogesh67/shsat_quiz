-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'TRIAL', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "premiumEndsAt" TIMESTAMP(3),
ADD COLUMN     "premiumStartedAt" TIMESTAMP(3),
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialStartedAt" TIMESTAMP(3);
