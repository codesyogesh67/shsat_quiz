-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'FREE_RESPONSE', 'GRID_IN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "examKey" TEXT,
    "index" INTEGER NOT NULL,
    "category" TEXT,
    "type" "public"."QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "stem" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "choices" JSONB,
    "media" JSONB,
    "explanation" TEXT,
    "tags" TEXT[],
    "difficulty" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "examId" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "year" INTEGER,
    "form" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "givenAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Question_examKey_index_idx" ON "public"."Question"("examKey", "index");

-- CreateIndex
CREATE INDEX "Question_examKey_externalId_idx" ON "public"."Question"("examKey", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_key_key" ON "public"."Exam"("key");

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "public"."Attempt"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "public"."Attempt"("userId");

-- CreateIndex
CREATE INDEX "Attempt_sessionId_idx" ON "public"."Attempt"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
