"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const utils_1 = require("../auth/utils");
const email_1 = require("../lib/email");
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
};
exports.authController = {
    // POST /api/v1/auth/register
    register: async (req, res) => {
        try {
            const { name, email, password, companyId, roleId } = req.body;
            if (!name || !email || !password || !companyId || !roleId) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing required fields" });
            }
            const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res
                    .status(409)
                    .json({ success: false, message: "Email already in use" });
            }
            const passwordHash = await (0, utils_1.hashPassword)(password);
            const user = await prisma_1.prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    passwordSetAt: new Date(),
                    companyId,
                    roleId,
                },
            });
            // return minimal user data (do not return passwordHash)
            return res.status(201).json({
                success: true,
                user: { id: user.id, name: user.name, email: user.email },
            });
        }
        catch (error) {
            console.error("Register error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing credentials" });
            }
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user || !user.passwordHash) {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }
            const ok = await (0, utils_1.comparePassword)(password, user.passwordHash);
            if (!ok) {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }
            // 1. Sign access token
            const accessToken = (0, utils_1.signAccessToken)(user.id, user.email);
            // 2. Create session in DB first
            const session = await prisma_1.prisma.session.create({
                data: {
                    userId: user.id,
                    userAgent: req.get("user-agent") ?? null,
                    ip: req.ip,
                    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                },
            });
            // 3. Sign refresh token with session.id as jti
            const refreshToken = (0, utils_1.signRefreshToken)(user.id, user.email, session.id);
            // 4. Store hashed refresh token in the session
            const refreshTokenHash = await (0, utils_1.hashPassword)(refreshToken);
            await prisma_1.prisma.session.update({
                where: { id: session.id },
                data: { refreshTokenHash },
            });
            // 5. Set httpOnly cookie for refresh token
            res.cookie("refreshToken", refreshToken, refreshCookieOptions);
            // 6. Return response
            return res.json({
                success: true,
                accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    companyId: user.companyId,
                    roleId: user.roleId,
                    passwordSetAt: user.passwordSetAt,
                },
                sessionId: session.id,
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/refresh
    refresh: async (req, res) => {
        try {
            const token = req.cookies?.refreshToken;
            if (!token) {
                return res.status(401).json({ success: false, message: "No token" });
            }
            let payload;
            try {
                payload = (0, utils_1.verifyRefreshToken)(token);
            }
            catch {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid token" });
            }
            const sessionId = payload.jti;
            const userId = payload.sub;
            const session = await prisma_1.prisma.session.findUnique({
                where: { id: sessionId },
            });
            if (!session || session.revoked || session.expiresAt < new Date()) {
                return res
                    .status(401)
                    .json({ success: false, message: "Session invalid" });
            }
            if (!session.refreshTokenHash) {
                return res
                    .status(401)
                    .json({ success: false, message: "Session invalid" });
            }
            const tokenMatches = await (0, utils_1.comparePassword)(token, session.refreshTokenHash);
            if (!tokenMatches) {
                // revoke all sessions to protect against reuse
                await prisma_1.prisma.session.updateMany({
                    where: { userId: session.userId },
                    data: { revoked: true },
                });
                return res
                    .status(401)
                    .json({ success: false, message: "Token reuse detected" });
            }
            // revoke old session
            await prisma_1.prisma.session.update({
                where: { id: session.id },
                data: { revoked: true },
            });
            // create new session
            const newExpiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
            const newSession = await prisma_1.prisma.session.create({
                data: {
                    userId,
                    userAgent: req.get("user-agent") ?? null,
                    ip: req.ip,
                    expiresAt: newExpiresAt,
                },
            });
            // new refresh token
            const newRefreshToken = (0, utils_1.signRefreshToken)(userId, payload.email, newSession.id);
            const newRefreshHash = await (0, utils_1.hashPassword)(newRefreshToken);
            await prisma_1.prisma.session.update({
                where: { id: newSession.id },
                data: { refreshTokenHash: newRefreshHash },
            });
            // new access token
            const newAccessToken = (0, utils_1.signAccessToken)(userId, payload.email);
            // set cookie
            res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
            return res.json({ success: true, accessToken: newAccessToken });
        }
        catch (error) {
            console.error("Refresh error:", error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/logout
    logout: async (req, res) => {
        try {
            const token = req.cookies?.refreshToken;
            if (token) {
                try {
                    const payload = (0, utils_1.verifyRefreshToken)(token);
                    const sessionId = payload.jti;
                    await prisma_1.prisma.session.update({
                        where: { id: sessionId },
                        data: { revoked: true },
                    });
                }
                catch (err) {
                    // Ignore errors, still clear cookie
                    console.warn("Logout token verification failed:", err);
                }
            }
            // clear cookie
            res.clearCookie("refreshToken", {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
            return res.json({ success: true });
        }
        catch (error) {
            console.error("Logout error:", error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // GET /api/v1/auth/me
    me: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                return res
                    .status(401)
                    .json({ success: false, message: "Missing token" });
            }
            const token = authHeader.split(" ")[1];
            let payload;
            try {
                payload = (0, utils_1.verifyAccessToken)(token);
            }
            catch (err) {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid token" });
            }
            // @ts-ignore sub
            const userId = payload.sub;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    companyId: true,
                    roleId: true,
                },
            });
            if (!user)
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });
            return res.json({ success: true, user });
        }
        catch (error) {
            console.error("Me error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/password-reset/request
    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                return res
                    .status(400)
                    .json({ success: false, message: "Email required" });
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            // Always return success to avoid user enumeration
            if (!user)
                return res.json({ success: true });
            const rawToken = crypto_1.default.randomBytes(32).toString("hex");
            const tokenHash = await (0, utils_1.hashPassword)(rawToken);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await prisma_1.prisma.passwordReset.upsert({
                where: { userId: user.id },
                create: { userId: user.id, tokenHash, expiresAt },
                update: { tokenHash, expiresAt },
            });
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&userId=${user.id}`;
            const html = `
  <p>Click the button below to reset your password:</p>
  <a href="${resetUrl}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
  <p>This link expires in 1 hour.</p>
`;
            await (0, email_1.sendEmail)(user.email, "Password Reset", html);
            return res.json({ success: true });
        }
        catch (error) {
            console.error("requestPasswordReset error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/password-reset/confirm
    confirmPasswordReset: async (req, res) => {
        try {
            const { userId, token, newPassword } = req.body;
            if (!userId || !token || !newPassword) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing required fields" });
            }
            const pr = await prisma_1.prisma.passwordReset.findUnique({ where: { userId } });
            if (!pr)
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid or expired token" });
            if (pr.expiresAt < new Date()) {
                // delete expired record
                await prisma_1.prisma.passwordReset
                    .delete({ where: { userId } })
                    .catch(() => { });
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid or expired token" });
            }
            const ok = await (0, utils_1.comparePassword)(token, pr.tokenHash);
            if (!ok)
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid token" });
            const newHash = await (0, utils_1.hashPassword)(newPassword);
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newHash, passwordSetAt: new Date() },
            });
            // remove token and revoke all sessions
            await prisma_1.prisma.passwordReset.delete({ where: { userId } });
            await prisma_1.prisma.session.updateMany({
                where: { userId },
                data: { revoked: true },
            });
            return res.json({ success: true });
        }
        catch (error) {
            console.error("confirmPasswordReset error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
    // POST /api/v1/auth/change-password
    changePassword: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                return res
                    .status(401)
                    .json({ success: false, message: "Missing token" });
            }
            const token = authHeader.split(" ")[1];
            let payload;
            try {
                payload = (0, utils_1.verifyAccessToken)(token);
            }
            catch {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid token" });
            }
            const userId = payload.sub;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing required fields" });
            }
            // get user with password hash
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user || !user.passwordHash) {
                return res
                    .status(400)
                    .json({ success: false, message: "User has no password set" });
            }
            // verify old password
            const ok = await (0, utils_1.comparePassword)(oldPassword, user.passwordHash);
            if (!ok) {
                return res
                    .status(401)
                    .json({ success: false, message: "Old password incorrect" });
            }
            // hash new password
            const newHash = await (0, utils_1.hashPassword)(newPassword);
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newHash, passwordSetAt: new Date() },
            });
            // revoke all sessions (force logout everywhere)
            await prisma_1.prisma.session.updateMany({
                where: { userId },
                data: { revoked: true },
            });
            const updatedUser = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            return res.json({
                success: true,
                message: "Password updated successfully",
                user: updatedUser,
            });
        }
        catch (error) {
            console.error("changePassword error:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    },
};
