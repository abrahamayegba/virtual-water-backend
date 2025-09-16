"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.protectedRoutes = (0, express_1.Router)();
// Example protected route
exports.protectedRoutes.get("/protected", auth_middleware_1.authenticate, (req, res) => {
    return res.json({
        success: true,
        message: "You accessed a protected route!",
        user: req.user, // this comes from the JWT
    });
});
