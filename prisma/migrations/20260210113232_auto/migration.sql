/*
  Warnings:

  - The `status` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "status",
ADD COLUMN     "status" "public"."CompanyStatus" NOT NULL DEFAULT 'ACTIVE';
