import { Router, Request, Response } from "express";
import { lookupPostcodeService } from "../services/lookupPostcode.service";

const WebhookToolsRouter = Router();

WebhookToolsRouter.post("/lookup-postcode", async (req: Request, res: Response) => {
  try {
    const toolCallId = req.body?.message?.toolCallList?.[0]?.id;
    const postcode =
      req.body?.message?.toolCallList?.[0]?.function?.arguments?.postcode;

    if (!postcode) {
      return res.status(200).json({
        results: [{ toolCallId, result: "Invalid postcode." }],
      });
    }

    const result = await lookupPostcodeService(postcode);

    return res.status(200).json({
      results: [{ toolCallId, result: JSON.stringify(result) }],
    });
  } catch (err) {
    console.error("[lookupPostcode] Error:", err);
    return res.status(200).json({
      results: [
        {
          toolCallId: req.body?.message?.toolCallList?.[0]?.id,
          result: "Lookup failed.",
        },
      ],
    });
  }
});

export default WebhookToolsRouter;
