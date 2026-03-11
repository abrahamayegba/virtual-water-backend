// src/services/managerCall.service.ts
import { prisma } from "../lib/prisma";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 30_000; // 30 seconds

export async function triggerManagerCall(callId: string) {
  const call = await prisma.webhookCustomerCall.findUnique({
    where: { id: callId },
  });

  if (!call) throw new Error("Call not found");

  let attempt = 0;
  let vapiCallData: any;

  while (attempt < MAX_RETRIES) {
    attempt++;

    try {
      const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: process.env.VAPI_MANAGER_ASSISTANT_ID,
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
          customer: {
            number: process.env.MANAGER_PHONE_NUMBER,
          },
          metadata: {
            name: call.customerName,
            phone: call.customerPhone,
            address: call.customerAddress,
            issue: call.faultDescription,
          },
        }),
      });

      if (!response.ok)
        throw new Error(`Vapi call failed (attempt ${attempt})`);

      vapiCallData = await response.json();

      await prisma.webhookCustomerCall.update({
        where: { id: call.id },
        data: {
          managerCallId: vapiCallData.id,
          managerNotified: true,
          managerCallStatus: "pending",
          managerCallTime: new Date(),
        },
      });

      // Poll actual Vapi call status
      const finalStatus = await pollVapiCallStatus(vapiCallData.id);

      await prisma.webhookCustomerCall.update({
        where: { id: call.id },
        data: { managerCallStatus: finalStatus },
      });

      if (finalStatus === "reached" || finalStatus === "voicemail") break;

      if (attempt < MAX_RETRIES) {
        console.log(
          `Manager call not answered, retrying in ${RETRY_DELAY_MS / 1000}s...`,
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    } catch (err) {
      console.error(`Manager call attempt ${attempt} failed:`, err);
      if (attempt >= MAX_RETRIES) {
        await prisma.webhookCustomerCall.update({
          where: { id: call.id },
          data: { managerCallStatus: "failed" },
        });
        throw new Error("Failed to trigger manager call after retries");
      }
    }
  }

  return vapiCallData;
}

// Poll Vapi for actual call status
async function pollVapiCallStatus(managerCallId: string): Promise<string> {
  const response = await fetch(`https://api.vapi.ai/call/${managerCallId}`, {
    headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch call status from Vapi");
  }

  const data = await response.json();
  // data.status should be one of: pending, reached, voicemail, failed
  return data.status;
}
