import { Router } from "express";
import { quizController } from "../controllers/quiz.controller";

export const quizRoutes = Router();

quizRoutes.post("/", quizController.createQuiz);
quizRoutes.get("/", quizController.getQuizzes);
quizRoutes.get("/:id", quizController.getQuizById);
quizRoutes.put("/:id", quizController.updateQuiz);
quizRoutes.delete("/:id", quizController.deleteQuiz);
quizRoutes.get("/course/:courseId", quizController.getQuizzesByCourseId);


