"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
exports.authRoutes = (0, express_1.Router)();
// Register a new user
exports.authRoutes.post("/register", auth_controller_1.authController.register);
// Login user
exports.authRoutes.post("/login", auth_controller_1.authController.login);
// Refresh access token
exports.authRoutes.post("/refresh", auth_controller_1.authController.refresh);
// Logout user (invalidate refresh token/session)
exports.authRoutes.post("/logout", auth_controller_1.authController.logout);
// Change password 
exports.authRoutes.post("/change-password", auth_controller_1.authController.changePassword);
// Forgot password
exports.authRoutes.post("/password-reset/request", auth_controller_1.authController.requestPasswordReset);
// Confirm new password
exports.authRoutes.post("/password-reset/confirm", auth_controller_1.authController.confirmPasswordReset);
