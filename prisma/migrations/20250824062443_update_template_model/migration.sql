/*
  Warnings:

  - You are about to drop the column `overlayLog` on the `templates` table. All the data in the column will be lost.
  - Added the required column `overlayLogo` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."templates" DROP COLUMN "overlayLog",
ADD COLUMN     "overlayLogo" TEXT NOT NULL;
