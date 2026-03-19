import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

export async function triggerManagerCall(callId: string) {
  const call = await prisma.webhookCustomerCall.findUnique({
    where: { id: callId },
  });
  if (!call) throw new Error(`Call not found: ${callId}`);

  const vapiBody = {
    assistantId: process.env.VAPI_MANAGER_ASSISTANT_ID,
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: process.env.MANAGER_PHONE_NUMBER },
    metadata: { callId }, // ← add this
    assistantOverrides: {
      variableValues: {
        caller_full_name: call.customerName,
        caller_number: call.customerPhone || "",
        address: call.customerAddress || "",
        fault_description: call.faultDescription || "",
        property_type: call.propertyType || "domestic",
        is_emergency: call.isEmergency,
        additional_notes: call.additionalNotes || "",
        callId: callId,
      },
    },
  };

  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vapiBody),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`Vapi API error for callId ${callId}:`, err);
    throw new Error("Vapi call failed");
  }

  const vapiCallData = await response.json();

  await prisma.webhookCustomerCall.update({
    where: { id: call.id },
    data: {
      managerCallId: vapiCallData.id,
      managerNotified: true,
      managerCallStatus: "pending",
      managerCallTime: new Date(),
    },
  });

  console.log(`✅ Manager call triggered! Vapi ID: ${vapiCallData.id}`);
  return vapiCallData;
}
