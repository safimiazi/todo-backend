-- AlterTable
ALTER TABLE "public"."clips" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT true;
