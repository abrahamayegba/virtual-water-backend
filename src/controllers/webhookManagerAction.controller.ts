// src/controllers/managerAction.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { triggerManagerActionAgent } from "../services/managerAction.service";

export async function handleManagerAction(req: Request, res: Response) {
  try {
    const { callId, managerAction, managerNotes } = req.body;

    if (!callId || !managerAction) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update DB with manager action and optional notes
    await prisma.webhookCustomerCall.update({
      where: { id: callId },
      data: {
        managerAction,
        additionalNotes: managerNotes || undefined,
        managerActionTime: new Date(),
      },
    });

    // Trigger the third agent (calls the customer)
    await triggerManagerActionAgent(callId);

    return res
      .status(200)
      .json({ success: true, message: "Manager action recorded" });
  } catch (err) {
    console.error("Manager action error:", err);
    return res.status(500).json({ error: "Failed to record manager action" });
  }
}
