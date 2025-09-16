import { Router } from "express";
import { roleController } from "../controllers/role.controller";

export const roleRoutes = Router();

roleRoutes.post("/", roleController.createRole);
roleRoutes.get("/", roleController.getRoles);
roleRoutes.get("/:id", roleController.getRoleById);
roleRoutes.put("/:id", roleController.updateRole);
roleRoutes.delete("/:id", roleController.deleteRole);
