-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "practiceId" TEXT;

-- CreateTable
CREATE TABLE "public"."Practice" (
    "id" TEXT NOT NULL,
    "practiceNumber" TEXT,
    "practiceName" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Practice_companyId_idx" ON "public"."Practice"("companyId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "public"."Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Practice" ADD CONSTRAINT "Practice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
