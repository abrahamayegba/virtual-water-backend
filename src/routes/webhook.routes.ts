
import { Router } from "express";
import { handleCustomerCall } from "../controllers/webhookCustomerCall.controller";

export const webhookRoutes = Router();

webhookRoutes.post("/customer-call", handleCustomerCall);

