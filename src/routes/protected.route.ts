import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

export const protectedRoutes = Router();

// Example protected route
protectedRoutes.get("/protected", authenticate, (req, res) => {
  return res.json({
    success: true,
    message: "You accessed a protected route!",
    user: (req as any).user, // this comes from the JWT
  });
});
