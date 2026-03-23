import { Router } from "express";
import { feedbackController } from "../controllers/courseFeedback.controller";

export const feedbackRoutes = Router();

feedbackRoutes.post("/", feedbackController.submit);

feedbackRoutes.get("/:courseId", feedbackController.getByCourse);
