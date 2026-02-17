import { Router } from "express";
import { reportController } from "../controllers/report.controller";

export const reportRoutes = Router();

// Overview stats
reportRoutes.get("/overview", reportController.getOverview);

// Performance by company
reportRoutes.get("/by-company", reportController.getByCompany);

// Performance by course
reportRoutes.get("/by-course", reportController.getByCourse);

// Recent completions
reportRoutes.get("/recent", reportController.getRecent);
reportRoutes.get(
  "/user-training-records",
  reportController.getUserTrainingRecords,
);
