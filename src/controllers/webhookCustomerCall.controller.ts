// src/controllers/webhookCustomerCall.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../lib/email";
import { triggerManagerCall } from "../services/managerCall.service";
import dotenv from "dotenv";
dotenv.config(); // must be called before using process.env

export async function handleCustomerCall(req: Request, res: Response) {
  try {
    const {
      name,
      caller_number,
      address,
      postcode,
      fault_description,
      additional_notes,
    } = req.body;

    if (!name || !address || !postcode || !fault_description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const call = await prisma.webhookCustomerCall.create({
      data: {
        customerName: name,
        customerPhone: caller_number || "",
        customerAddress: `${address}, ${postcode}`,
        faultDescription: fault_description,
        callStatus: "completed",
      },
    });

    const html = `
      <h2>Emergency Call Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${caller_number || "Not provided"}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Postcode:</strong> ${postcode}</p>
      <p><strong>Issue:</strong> ${fault_description}</p>
      <p><strong>Notes:</strong> ${additional_notes || "None"}</p>
    `;

    await sendEmail(
      process.env.MANAGER_EMAIL as string,
      "Emergency Maintenance Call",
      html,
    );

    await prisma.webhookCustomerCall.update({
      where: { id: call.id },
      data: {
        reportEmailSent: true,
        reportSentTime: new Date(),
      },
    });

    await triggerManagerCall(call.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Failed to process call" });
  }
}

export async function handleVapiWebhook(req: Request, res: Response) {
  try {
    const body = req.body;
    const msg = body.message;

    if (!msg) {
      console.error("Invalid Vapi payload:", body);
      return res.status(200).json({ success: true });
    }

    const eventType = msg.type;
    const callId = msg.call?.metadata?.callId;
    const endedReason = msg.endedReason || msg.call?.endedReason;

    console.log(
      `📨 Vapi webhook: ${eventType} | callId: ${callId} | endedReason: ${endedReason}`,
    );

    // Only act once when the call is fully finished
    if (eventType === "end-of-call-report" && callId && endedReason) {
      const record = await prisma.webhookCustomerCall.findUnique({
        where: { id: callId },
      });

      if (!record) return res.status(200).json({ success: true });

      const isReached = ![
        "customer-did-not-answer",
        "voicemail",
        "customer-busy",
      ].includes(endedReason);

      // Update final status
      await prisma.webhookCustomerCall.update({
        where: { id: callId },
        data: {
          managerCallStatus: isReached
            ? "reached"
            : endedReason === "voicemail"
              ? "voicemail"
              : "failed",
        },
      });

      console.log(
        `✅ DB updated: ${callId} → ${isReached ? "REACHED" : endedReason}`,
      );

      // Retry ONCE if voicemail and this was first attempt
      if (
        endedReason === "voicemail" &&
        record.managerCallStatus === "pending"
      ) {
        console.log("📞 Voicemail detected. Retrying once...");

        setTimeout(() => {
          triggerManagerCall(callId);
        }, 20000); // retry after 20 seconds
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return res.status(200).json({ success: true });
  }
}
