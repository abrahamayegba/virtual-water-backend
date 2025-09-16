import { Router } from "express";
import { questionOptionController } from "../controllers/questionOption.controller";

export const questionOptionRoutes = Router();

questionOptionRoutes.post("/", questionOptionController.createOption);
questionOptionRoutes.get("/", questionOptionController.getOptions);
questionOptionRoutes.get("/:id", questionOptionController.getOptionById);
questionOptionRoutes.put("/:id", questionOptionController.updateOption);
questionOptionRoutes.delete("/:id", questionOptionController.deleteOption);
