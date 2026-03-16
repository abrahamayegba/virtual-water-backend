import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";
dotenv.config();

export async function handleInboundCall(req: Request, res: Response) {
  try {
    const callerNumber = req.body?.call?.customer?.number;

    if (!callerNumber) {
      console.error("No caller number found in payload:", req.body);
      return res.status(400).json({ error: "Missing caller number" });
    }

    // Check DB for existing open call where manager hasn't been reached
    const existingOpenCall = await prisma.webhookCustomerCall.findFirst({
      where: {
        customerPhone: callerNumber,
        managerCallStatus: { not: "reached" }, // only consider calls where manager hasn't been reached
        callStatus: "pending",
      },
      orderBy: { inboundCallTime: "desc" },
    });

    const isRepeat = !!existingOpenCall;

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
