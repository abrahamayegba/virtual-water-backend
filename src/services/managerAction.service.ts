import { prisma } from "../lib/prisma";

export async function triggerManagerActionAgent(callId: string) {
  const call = await prisma.webhookCustomerCall.findUnique({
    where: { id: callId },
  });
  if (!call) throw new Error(`Call not found: ${callId}`);

  // Only pass manager action, property type, and customer name
  const vapiBody = {
    assistantId: process.env.VAPI_MANAGER_ACTION_ASSISTANT_ID,
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: call.customerPhone }, // customer number
    assistantOverrides: {
      variableValues: {
        callId,
        customer_name: call.customerName,
        property_type: call.propertyType || "domestic",
        manager_action: call.managerAction || "",
        additional_notes: call.additionalNotes || "",
        manager_notified_time: call.managerCallTime
          ? call.managerCallTime.toLocaleString("en-GB")
          : "",
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
    console.error(`Vapi Manager Action API error for callId ${callId}:`, err);
    throw new Error("Manager Action AI call failed");
  }

  const data = await response.json();
  console.log(`✅ Manager Action AI triggered: ${data.id}`);
  return data;
}
