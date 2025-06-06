-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "includeImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "includeSearch" BOOLEAN NOT NULL DEFAULT false;
