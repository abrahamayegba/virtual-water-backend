import { Router } from "express";
import { adminController } from "../controllers/admin.controller";

export const adminRoutes = Router();

adminRoutes.post("/", adminController.createAdmin);
adminRoutes.get("/", adminController.getAdmins);
adminRoutes.get("/:id", adminController.getAdminById);
adminRoutes.put("/:id", adminController.updateAdmin);
adminRoutes.delete("/:id", adminController.deleteAdmin);
