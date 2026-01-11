/*
  Warnings:

  - You are about to drop the column `messageCount` on the `Slowmode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[channel]` on the table `Slowmode` will be added. If there are existing duplicate values, this will fail.
  - Made the column `channel` on table `Slowmode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Slowmode" DROP COLUMN "messageCount",
ALTER COLUMN "channel" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Slowmode_channel_key" ON "Slowmode"("channel");
