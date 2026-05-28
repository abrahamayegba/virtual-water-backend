import { Router } from "express";
import { practiceControllers } from "../controllers/practice.controller";

export const practiceRoutes = Router();

practiceRoutes.get("/", practiceControllers.getPractices);
practiceRoutes.get("/:id", practiceControllers.getPracticeById);
practiceRoutes.post("/", practiceControllers.createPractice);
practiceRoutes.put("/:id", practiceControllers.updatePractice);
practiceRoutes.delete("/:id", practiceControllers.deletePractice);
