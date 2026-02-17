import { Router } from "express";
import { quizController } from "../controllers/quiz.controller";

export const quizRoutes = Router();

quizRoutes.post("/", quizController.createQuiz);

quizRoutes.get("/course/:courseId", quizController.getQuizzesByCourseId);

// delete-by-course MUST exist (see next section)
quizRoutes.delete("/course/:courseId", quizController.deleteQuizByCourseId);

quizRoutes.get("/", quizController.getQuizzes);
quizRoutes.get("/:id", quizController.getQuizById);
quizRoutes.put("/:id", quizController.updateQuiz);
quizRoutes.delete("/:id", quizController.deleteQuiz);


