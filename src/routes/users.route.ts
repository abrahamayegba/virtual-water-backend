import { Router } from "express";
import { userControllers } from "../controllers/user.controller.ts";

export const userRoutes = Router();

userRoutes.get("/", userControllers.getUsers);
userRoutes.get("/:id", userControllers.getUserById);
userRoutes.post("/", userControllers.createUser);
userRoutes.put("/:id", userControllers.updateUser);
userRoutes.delete("/:id", userControllers.deleteUser);
