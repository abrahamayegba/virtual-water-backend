import { Router } from "express";
import { handleInboundCall } from "../controllers/webhookInboundCall.controller";

export const inboundRoutes = Router();

inboundRoutes.post("/inbound-call", handleInboundCall);
