-- AlterTable
ALTER TABLE "public"."WebhookCustomerCall" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "managerAction" TEXT,
ADD COLUMN     "managerActionTime" TIMESTAMP(3);
