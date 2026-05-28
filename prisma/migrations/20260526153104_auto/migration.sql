/*
  Warnings:

  - A unique constraint covering the columns `[practiceNumber,companyId]` on the table `Practice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Practice_practiceNumber_companyId_key" ON "public"."Practice"("practiceNumber", "companyId");
