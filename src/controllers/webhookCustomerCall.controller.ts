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
      property_type,
      is_emergency,
    } = req.body;

    if (
      !name ||
      !address ||
      !postcode ||
      !fault_description ||
      !property_type ||
      !is_emergency // now check if string exists
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Normalise property type
    const normalisedPropertyType =
      property_type.toLowerCase() === "commercial" ? "commercial" : "domestic";

    const cleanedNumber = normaliseUKNumber(caller_number);

    const call = await prisma.webhookCustomerCall.create({
      data: {
        customerName: name,
        customerPhone: cleanedNumber || "",
        customerAddress: `${address}, ${postcode}`,
        faultDescription: fault_description,
        additionalNotes: additional_notes || "",
        propertyType: normalisedPropertyType,
        isEmergency: is_emergency,
        callStatus: "completed",
      },
    });

    const html = `
      <h2>Maintenance Call Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${cleanedNumber || "Not provided"}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Postcode:</strong> ${postcode}</p>
      <p><strong>Property Type:</strong> ${normalisedPropertyType}</p>
      <p><strong>Emergency:</strong> ${is_emergency}</p>
      <p><strong>Issue:</strong> ${fault_description}</p>
      <p><strong>Notes:</strong> ${additional_notes || "None"}</p>
    `;

    await sendEmail(
      process.env.MANAGER_EMAIL as string,
      is_emergency === "an emergency"
        ? "🚨 Emergency Maintenance Call"
        : "Maintenance Call Report",
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

    // ----------------------------
    // Handle end-of-call (manager AI)
    // ----------------------------
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

      if (
        endedReason === "voicemail" &&
        record.managerCallStatus === "pending"
      ) {
        console.log("📞 Voicemail detected. Retrying once...");
        setTimeout(() => triggerManagerCall(callId), 20000);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return res.status(200).json({ success: true });
  }
}
function normaliseUKNumber(input?: string) {
  if (!input) return "";

  const cleaned = input.replace(/[^\d+]/g, "").trim();

  // Already correct format
  if (cleaned.startsWith("+44")) return cleaned;

  // Convert 07XXXXXXXXX → +447XXXXXXXXX
  if (cleaned.startsWith("07")) {
    return "+44" + cleaned.substring(1);
  }

  // Convert 447XXXXXXXXX → +447XXXXXXXXX
  if (cleaned.startsWith("44") && !cleaned.startsWith("+44")) {
    return "+" + cleaned;
  }

  return cleaned; // fallback
}
