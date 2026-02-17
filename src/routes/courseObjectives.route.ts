import { Router } from "express";
import { courseObjectiveController } from "../controllers/courseObjective.controller";

export const courseObjectiveRoutes = Router();

courseObjectiveRoutes.post("/", courseObjectiveController.createObjective);
courseObjectiveRoutes.get("/", courseObjectiveController.getObjectives);
courseObjectiveRoutes.get(
  "/course/:courseId",
  courseObjectiveController.getObjectivesByCourseId,
);
courseObjectiveRoutes.get("/:id", courseObjectiveController.getObjectiveById);
courseObjectiveRoutes.put("/:id", courseObjectiveController.updateObjective);
courseObjectiveRoutes.delete(
  "/course/:courseId",
  courseObjectiveController.deleteObjectivesByCourseId,
);
courseObjectiveRoutes.delete("/:id", courseObjectiveController.deleteObjective);
