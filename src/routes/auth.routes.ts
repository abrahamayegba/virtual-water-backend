import { Router } from "express";
import { authController } from "../controllers/auth.controller";

export const authRoutes = Router();

// Register a new user
authRoutes.post("/register", authController.register);

// Login user
authRoutes.post("/login", authController.login);

// Refresh access token
authRoutes.post("/refresh", authController.refresh);

// Logout user (invalidate refresh token/session)
authRoutes.post("/logout", authController.logout);

// Change password 
authRoutes.post("/change-password", authController.changePassword);

// Forgot password
authRoutes.post("/password-reset/request", authController.requestPasswordReset);

// Confirm new password
authRoutes.post("/password-reset/confirm", authController.confirmPasswordReset);
