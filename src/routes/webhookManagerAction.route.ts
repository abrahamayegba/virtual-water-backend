// src/routes/managerActionRoutes.ts
import { Router } from "express";
import { handleManagerAction } from "../controllers/webhookManagerAction.controller";

export const managerActionRoutes = Router();

// This is the route your tool will post to
managerActionRoutes.post("/manager-action", handleManagerAction);
