-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "lessonId" TEXT,
ADD COLUMN     "lessonType" TEXT;

-- AlterTable
ALTER TABLE "vocabulary" ADD COLUMN     "lastReviewAt" TIMESTAMP(3),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;
