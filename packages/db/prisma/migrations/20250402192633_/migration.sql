/*
  Warnings:

  - You are about to drop the column `totalToknes` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "totalToknes",
ADD COLUMN     "totalTokens" BIGINT;
