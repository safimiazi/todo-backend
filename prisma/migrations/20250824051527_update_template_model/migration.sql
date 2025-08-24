/*
  Warnings:

  - The primary key for the `templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aiSettings` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `templates` table. All the data in the column will be lost.
  - The `id` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `aspectRatio` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caption` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorTheme` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `introVideo` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outroVideo` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overlayLog` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateName` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."templates_name_key";

-- AlterTable
ALTER TABLE "public"."templates" DROP CONSTRAINT "templates_pkey",
DROP COLUMN "aiSettings",
DROP COLUMN "category",
DROP COLUMN "config",
DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "aspectRatio" TEXT NOT NULL,
ADD COLUMN     "caption" TEXT NOT NULL,
ADD COLUMN     "colorTheme" TEXT NOT NULL,
ADD COLUMN     "introVideo" TEXT NOT NULL,
ADD COLUMN     "outroVideo" TEXT NOT NULL,
ADD COLUMN     "overlayLog" TEXT NOT NULL,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "templateName" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");
