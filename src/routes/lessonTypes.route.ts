import { Router } from "express";
import { lessonTypeController } from "../controllers/lessonType.controller.ts";

export const lessonTypeRoutes = Router();

lessonTypeRoutes.post("/", lessonTypeController.createLessonType);
lessonTypeRoutes.get("/", lessonTypeController.getLessonTypes);
lessonTypeRoutes.get("/:id", lessonTypeController.getLessonTypeById);
lessonTypeRoutes.put("/:id", lessonTypeController.updateLessonType);
lessonTypeRoutes.delete("/:id", lessonTypeController.deleteLessonType);
