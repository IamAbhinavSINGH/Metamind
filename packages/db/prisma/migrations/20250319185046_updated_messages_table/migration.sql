/*
  Warnings:

  - You are about to drop the column `author` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `completionTokens` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finishReason` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptTokens` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reasoning` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTime` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalToknes` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `modelName` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "author",
DROP COLUMN "content",
ADD COLUMN     "completionTokens" BIGINT NOT NULL,
ADD COLUMN     "finishReason" TEXT NOT NULL,
ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "promptTokens" BIGINT NOT NULL,
ADD COLUMN     "reasoning" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL,
ADD COLUMN     "responseTime" INTEGER NOT NULL,
ADD COLUMN     "totalToknes" BIGINT NOT NULL,
ALTER COLUMN "modelName" SET NOT NULL;
