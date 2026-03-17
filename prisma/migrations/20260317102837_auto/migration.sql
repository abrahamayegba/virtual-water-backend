-- AlterTable
ALTER TABLE "public"."WebhookCustomerCall" ADD COLUMN     "isEmergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "propertyType" TEXT;

-- CreateIndex
CREATE INDEX "WebhookCustomerCall_isEmergency_idx" ON "public"."WebhookCustomerCall"("isEmergency");

-- CreateIndex
CREATE INDEX "WebhookCustomerCall_propertyType_idx" ON "public"."WebhookCustomerCall"("propertyType");
