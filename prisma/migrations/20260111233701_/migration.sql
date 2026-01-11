-- AlterTable
ALTER TABLE "Slowmode" ADD COLUMN     "whitelistedUsers" TEXT[] DEFAULT ARRAY[]::TEXT[];
