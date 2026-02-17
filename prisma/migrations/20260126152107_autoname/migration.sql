/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."UserCourseLesson" ALTER COLUMN "spentTime" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."CourseCompany" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseCompany_companyId_idx" ON "public"."CourseCompany"("companyId");

-- CreateIndex
CREATE INDEX "CourseCompany_courseId_idx" ON "public"."CourseCompany"("courseId");

-- CreateIndex
CREATE INDEX "CourseCompany_assignedById_idx" ON "public"."CourseCompany"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompany_courseId_companyId_key" ON "public"."CourseCompany"("courseId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_userId_courseId_key" ON "public"."UserCourse"("userId", "courseId");

-- CreateIndex
CREATE INDEX "UserCourseLesson_userCourseId_idx" ON "public"."UserCourseLesson"("userCourseId");

-- CreateIndex
CREATE INDEX "UserCourseLesson_lessonId_idx" ON "public"."UserCourseLesson"("lessonId");

-- AddForeignKey
ALTER TABLE "public"."CourseCompany" ADD CONSTRAINT "CourseCompany_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompany" ADD CONSTRAINT "CourseCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompany" ADD CONSTRAINT "CourseCompany_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
