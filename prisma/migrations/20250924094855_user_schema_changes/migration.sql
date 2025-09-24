/*
  Warnings:

  - A unique constraint covering the columns `[externalAuthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalAuthId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "externalAuthId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "public"."User"("externalAuthId");
