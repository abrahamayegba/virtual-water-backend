-- AlterTable
ALTER TABLE "public"."WebhookCustomerCall" ALTER COLUMN "isEmergency" DROP NOT NULL,
ALTER COLUMN "isEmergency" DROP DEFAULT,
ALTER COLUMN "isEmergency" SET DATA TYPE TEXT;
