import { Router } from "express";
import {
  handleCustomerCall,
  handleVapiWebhook,
} from "../controllers/webhookCustomerCall.controller";

export const webhookRoutes = Router();

webhookRoutes.post("/customer-call", handleCustomerCall);

webhookRoutes.post("/vapi", handleVapiWebhook);
