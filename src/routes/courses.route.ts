import { Router } from "express";
import { courseController } from "../controllers/course.controller.ts";

export const courseRoutes = Router();

courseRoutes.post("/", courseController.createCourse);
courseRoutes.get("/", courseController.getCourses);
courseRoutes.get("/:id", courseController.getCourseById);
courseRoutes.put("/:id", courseController.updateCourse);
courseRoutes.delete("/:id", courseController.deleteCourse);

