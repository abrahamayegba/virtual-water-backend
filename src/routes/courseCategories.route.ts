import { Router } from "express";
import { courseCategoryController } from "../controllers/courseCategory.controller.ts";

export const courseCategoryRoutes = Router();

courseCategoryRoutes.post("/", courseCategoryController.createCategory);
courseCategoryRoutes.get("/", courseCategoryController.getCategories);
courseCategoryRoutes.get("/:id", courseCategoryController.getCategoryById);
courseCategoryRoutes.put("/:id", courseCategoryController.updateCategory);
courseCategoryRoutes.delete("/:id", courseCategoryController.deleteCategory);
