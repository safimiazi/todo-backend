/*
  Warnings:

  - You are about to drop the column `aspectRatio` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `outputUrl` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeVideoId` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `perClipDuration` to the `clips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `clips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `clips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoUrl` to the `clips` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_clipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."clip_segments" ADD COLUMN     "clipEditorUrl" TEXT,
ADD COLUMN     "relatedTopic" TEXT[],
ADD COLUMN     "transcript" TEXT,
ADD COLUMN     "videoId" INTEGER,
ADD COLUMN     "videoMsDuration" INTEGER,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "viralReason" TEXT,
ADD COLUMN     "viralScore" TEXT,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."clips" DROP COLUMN "aspectRatio",
DROP COLUMN "config",
DROP COLUMN "description",
DROP COLUMN "errorMessage",
DROP COLUMN "outputUrl",
DROP COLUMN "progress",
DROP COLUMN "template",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "title",
DROP COLUMN "youtubeUrl",
DROP COLUMN "youtubeVideoId",
ADD COLUMN     "clipCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "creditUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lenguage" TEXT,
ADD COLUMN     "perClipDuration" INTEGER NOT NULL,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD COLUMN     "videoUrl" TEXT NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "monthlyMinutesLimit" SET DEFAULT 10;

-- DropTable
DROP TABLE "public"."jobs";

-- DropTable
DROP TABLE "public"."sessions";

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripe" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "creditsAdded" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_key" ON "public"."payments"("stripe");

-- AddForeignKey
ALTER TABLE "public"."clips" ADD CONSTRAINT "clips_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
