import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

export async function handleInboundCall(req: Request, res: Response) {
  try {
    const eventType = req.body?.message?.type;

    if (eventType !== "assistant.started") {
      return res.status(200).json({ success: true });
    }

    const callerNumber =
      req.body?.customer?.number ||
      req.body?.message?.artifact?.variableValues?.customer?.number;

    if (!callerNumber) {
      console.warn("No caller number found");
      return res.status(200).json({ success: true });
    }

    const existingOpenCall = await prisma.webhookCustomerCall.findFirst({
      where: {
        customerPhone: callerNumber,
        managerCallStatus: { not: "reached" },
        callStatus: "pending",
      },
      orderBy: { inboundCallTime: "desc" },
    });

    const isRepeat = !!existingOpenCall;

    console.log("Repeat check:", { callerNumber, isRepeat });

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
