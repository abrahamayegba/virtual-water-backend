import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

export async function handleInboundCall(req: Request, res: Response) {
  try {
    const msg = req.body?.message;

    // Only handle initial call events
    const initialCallTypes = ["assistant.started"];
    if (!msg || !initialCallTypes.includes(msg.type)) {
      console.log("Ignoring non-initial call event:", msg?.type);
      return res.status(200).json({ success: true });
    }

    // Extract caller number from known paths
    const callerNumber =
      req.body?.call?.customer?.number ||
      req.body?.customer?.number ||
      req.body?.call?.from;

    if (!callerNumber) {
      console.warn("Inbound call ignored: missing caller number", req.body);
      return res.status(200).json({ success: true });
    }

    // Check DB for existing open call where manager hasn't been reached
    const existingOpenCall = await prisma.webhookCustomerCall.findFirst({
      where: {
        customerPhone: callerNumber,
        managerCallStatus: { not: "reached" },
        callStatus: "pending",
      },
      orderBy: { inboundCallTime: "desc" },
    });

    const isRepeat = !!existingOpenCall;

    // Log the info for confirmation
    console.log("Inbound call response:", {
      callerNumber,
      isRepeat,
      previousIssue: existingOpenCall?.faultDescription,
      previousAddress: existingOpenCall?.customerAddress,
      repeatCaseId: existingOpenCall?.id,
    });

    // Respond to Vapi
    return res.json({
      assistantId: process.env.VAPI_CUSTOMER_ASSISTANT_ID,
      assistantOverrides: {
        variableValues: {
          is_repeat: isRepeat,
          previous_issue: existingOpenCall?.faultDescription || "",
          previous_address: existingOpenCall?.customerAddress || "",
        },
      },
      metadata: {
        repeatCaseId: existingOpenCall?.id || null,
      },
    });
  } catch (err) {
    console.error("Inbound call error:", err);
    return res.status(500).json({ error: "Failed to check repeat caller" });
  }
}
