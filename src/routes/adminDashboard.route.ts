import { Router } from "express";
import { adminDashboardController } from "../controllers/adminDashboard.controller";

export const adminDashboardRoutes = Router();

adminDashboardRoutes.get("/dashboard", adminDashboardController.getDashboardData);

export default adminDashboardRoutes;
