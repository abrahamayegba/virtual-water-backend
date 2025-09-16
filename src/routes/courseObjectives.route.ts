import { Router } from "express";
import { courseObjectiveController } from "../controllers/courseObjective.controller";

export const courseObjectiveRoutes = Router();

courseObjectiveRoutes.post("/", courseObjectiveController.createObjective);
courseObjectiveRoutes.get("/", courseObjectiveController.getObjectives);
courseObjectiveRoutes.get("/:id", courseObjectiveController.getObjectiveById);
courseObjectiveRoutes.put("/:id", courseObjectiveController.updateObjective);
courseObjectiveRoutes.delete("/:id", courseObjectiveController.deleteObjective);
