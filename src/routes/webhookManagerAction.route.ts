// src/routes/managerActionRoutes.ts
import { Router } from "express";
import { handleManagerAction } from "../controllers/webhookManagerAction.controller";
import { triggerManagerActionAgent } from "../services/managerAction.service";
import { triggerManagerCall } from "../services/managerCall.service";

export const managerActionRoutes = Router();

// This is the route your tool will post to
managerActionRoutes.post("/manager-action", handleManagerAction);

managerActionRoutes.post(
  "/manager-action/trigger/:callId",
  async (req, res) => {
    const { callId } = req.params;

    try {
      const data = await triggerManagerActionAgent(callId);
      return res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to trigger manager action agent:`, message);
      return res.status(500).json({ message });
    }
  },
);

managerActionRoutes.post("/manager-call/trigger/:callId", async (req, res) => {
  const { callId } = req.params;
  try {
    const data = await triggerManagerCall(callId);
    return res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
});
