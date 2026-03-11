-- CreateTable
CREATE TABLE "public"."WebhookCustomerCall" (
    "id" TEXT NOT NULL,
    "vapiCallId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "faultDescription" TEXT NOT NULL,
    "callStatus" TEXT NOT NULL DEFAULT 'pending',
    "inboundCallDuration" INTEGER NOT NULL DEFAULT 0,
    "managerCallId" TEXT,
    "managerNotified" BOOLEAN NOT NULL DEFAULT false,
    "managerCallStatus" TEXT,
    "managerCallTime" TIMESTAMP(3),
    "inboundCallTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportSentTime" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "reportEmailTo" TEXT,
    "transcript" TEXT,
    "recordingUrl" TEXT,

    CONSTRAINT "WebhookCustomerCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookCustomerCall_vapiCallId_key" ON "public"."WebhookCustomerCall"("vapiCallId");

-- CreateIndex
CREATE INDEX "WebhookCustomerCall_callStatus_idx" ON "public"."WebhookCustomerCall"("callStatus");

-- CreateIndex
CREATE INDEX "WebhookCustomerCall_inboundCallTime_idx" ON "public"."WebhookCustomerCall"("inboundCallTime");

-- CreateIndex
CREATE INDEX "WebhookCustomerCall_managerNotified_idx" ON "public"."WebhookCustomerCall"("managerNotified");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookUser_email_key" ON "public"."WebhookUser"("email");

-- CreateIndex
CREATE INDEX "WebhookUser_email_idx" ON "public"."WebhookUser"("email");
