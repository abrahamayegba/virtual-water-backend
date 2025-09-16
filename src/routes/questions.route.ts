import { Router } from "express";
import { questionController } from "../controllers/question.controller";

export const questionRoutes = Router();

questionRoutes.post("/", questionController.createQuestion);
questionRoutes.get("/", questionController.getQuestions);
questionRoutes.get("/:id", questionController.getQuestionById);
questionRoutes.put("/:id", questionController.updateQuestion);
questionRoutes.delete("/:id", questionController.deleteQuestion);
