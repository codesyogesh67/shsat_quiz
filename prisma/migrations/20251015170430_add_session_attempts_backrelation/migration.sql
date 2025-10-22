/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,questionId]` on the table `Attempt` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `sessionId` on table `Attempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Attempt" ADD COLUMN     "firstAnsweredAt" TIMESTAMP(3),
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sessionId" SET NOT NULL,
ALTER COLUMN "givenAnswer" DROP NOT NULL,
ALTER COLUMN "isCorrect" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "flagsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progressCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionIds" TEXT[],
ADD COLUMN     "serverSecondsRemaining" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "scoreCorrect" SET DEFAULT 0,
ALTER COLUMN "scoreTotal" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_sessionId_questionId_key" ON "public"."Attempt"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
