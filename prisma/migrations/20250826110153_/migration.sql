/*
  Warnings:

  - You are about to drop the column `lenguage` on the `clips` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `clips` table. All the data in the column will be lost.
  - Added the required column `videoSourceInName` to the `clips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoSourceInNumber` to the `clips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."clips" DROP COLUMN "lenguage",
DROP COLUMN "source",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "langCode" TEXT,
ADD COLUMN     "videoSourceInName" TEXT NOT NULL,
ADD COLUMN     "videoSourceInNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "clips_userId_idx" ON "public"."clips"("userId");
