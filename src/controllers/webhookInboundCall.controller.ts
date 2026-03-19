import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

export async function handleInboundCall(req: Request, res: Response) {
  try {
    const callerNumber =
      req.body?.message?.customer?.number || // ← correct path
      req.body?.message?.call?.customer?.number || // fallback
      req.body?.customer?.number ||
      req.body?.phoneNumber ||
      req.body?.from;

    if (!callerNumber) {
      console.warn("[v0] No caller number found in webhook");
      // Still return the assistant so the call connects
      return res.status(200).json({
        assistantId: process.env.VAPI_CUSTOMER_ASSISTANT_ID,
      });
    }

    console.log("[v0] Processing webhook for caller:", callerNumber);

    const existingOpenCall = await prisma.webhookCustomerCall.findFirst({
      where: {
        customerPhone: callerNumber,
        managerCallStatus: { not: "reached" },
      },
      orderBy: { inboundCallTime: "desc" },
    });

    const isRepeat = !!existingOpenCall;

    console.log("Repeat check:", {
      callerNumber,
      isRepeat,
      foundCall: !!existingOpenCall,
    });

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
    // Still return the assistant so the call connects
    return res.status(200).json({
      assistantId: process.env.VAPI_CUSTOMER_ASSISTANT_ID,
    });
  }
}
