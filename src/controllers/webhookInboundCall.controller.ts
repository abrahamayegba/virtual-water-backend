import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

export async function handleInboundCall(req: Request, res: Response) {
  try {
    const callerNumber =
      req.body?.customer?.number ||
      req.body?.message?.artifact?.variableValues?.customer?.number ||
      req.body?.phoneNumber || // Add this
      req.body?.from; // And this

    if (!callerNumber) {
      console.warn("[v0] No caller number found in webhook");
      return res.status(200).json({ success: true });
    }

    console.log("[v0] Processing webhook for caller:", callerNumber);

    const existingOpenCall = await prisma.webhookCustomerCall.findFirst({
      where: {
        customerPhone: callerNumber,
        managerCallStatus: { not: "reached" },
        callStatus: "pending",
      },
      orderBy: { inboundCallTime: "desc" },
    });

    const isRepeat = !!existingOpenCall;

    console.log("[v0] Repeat check:", {
      callerNumber,
      isRepeat,
      foundCall: !!existingOpenCall,
    });

    // ✅ Return assistantOverrides on INITIAL webhook call
    return res.json({
      assistantId: process.env.VAPI_CUSTOMER_ASSISTANT_ID,
      assistantOverrides: {
        variableValues: {
          is_repeat: isRepeat,
          previous_issue: existingOpenCall?.faultDescription || "",
          previous_address: existingOpenCall?.customerAddress || "",
          caller_number: callerNumber,
        },
      },
      metadata: {
        repeatCaseId: existingOpenCall?.id || null,
      },
    });
  } catch (err) {
    console.error("[v0] Inbound call error:", err);
    return res.status(200).json({ success: true }); // Return 200 even on error
  }
}
