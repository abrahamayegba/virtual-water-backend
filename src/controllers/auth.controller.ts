import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.ts";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../auth/utils.ts";
import { sendEmail } from "../lib/email.ts";

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
};

console.log(process.env.FRONTEND_URL);

export const authController = {
  // POST /api/v1/auth/register
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, companyId, roleId } = req.body;
      if (!name || !email || !password || !companyId || !roleId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
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
    } catch (error: any) {
      console.error("Register error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/v1/auth/login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Missing credentials" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const ok = await comparePassword(password, user.passwordHash);
      if (!ok) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      // 1. Sign access token
      const accessToken = signAccessToken(user.id, user.email);

      // 2. Create session in DB first
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          userAgent: req.get("user-agent") ?? null,
          ip: req.ip,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });

      // 3. Sign refresh token with session.id as jti
      const refreshToken = signRefreshToken(user.id, user.email, session.id);

      // 4. Store hashed refresh token in the session
      const refreshTokenHash = await hashPassword(refreshToken);
      await prisma.session.update({
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
        },
        sessionId: session.id,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  // POST /api/v1/auth/refresh
  refresh: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        return res.status(401).json({ success: false, message: "No token" });
      }

      let payload;
      try {
        payload = verifyRefreshToken(token);
      } catch {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }

      const sessionId = payload.jti as string;
      const userId = payload.sub as string;

      const session = await prisma.session.findUnique({
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

      const tokenMatches = await comparePassword(
        token,
        session.refreshTokenHash
      );

      if (!tokenMatches) {
        // revoke all sessions to protect against reuse
        await prisma.session.updateMany({
          where: { userId: session.userId },
          data: { revoked: true },
        });
        return res
          .status(401)
          .json({ success: false, message: "Token reuse detected" });
      }

      // revoke old session
      await prisma.session.update({
        where: { id: session.id },
        data: { revoked: true },
      });

      // create new session
      const newExpiresAt = new Date(
        Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
      );
      const newSession = await prisma.session.create({
        data: {
          userId,
          userAgent: req.get("user-agent") ?? null,
          ip: req.ip,
          expiresAt: newExpiresAt,
        },
      });

      // new refresh token
      const newRefreshToken = signRefreshToken(
        userId,
        payload.email,
        newSession.id
      );
      const newRefreshHash = await hashPassword(newRefreshToken);

      await prisma.session.update({
        where: { id: newSession.id },
        data: { refreshTokenHash: newRefreshHash },
      });

      // new access token
      const newAccessToken = signAccessToken(userId, payload.email);

      // set cookie
      res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

      return res.json({ success: true, accessToken: newAccessToken });
    } catch (error: any) {
      console.error("Refresh error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/v1/auth/logout
  logout: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.refreshToken;
      if (token) {
        try {
          const payload = verifyRefreshToken(token);
          const sessionId = payload.jti as string;
          await prisma.session.update({
            where: { id: sessionId },
            data: { revoked: true },
          });
        } catch (err) {
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
    } catch (error: any) {
      console.error("Logout error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  // GET /api/v1/auth/me
  me: async (req: Request, res: Response) => {
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
        payload = verifyAccessToken(token);
      } catch (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }
      // @ts-ignore sub
      const userId = payload.sub as string;
      const user = await prisma.user.findUnique({
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
    } catch (error: any) {
      console.error("Me error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/v1/auth/password-reset/request
  requestPasswordReset: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "Email required" });

      const user = await prisma.user.findUnique({ where: { email } });
      // Always return success to avoid user enumeration
      if (!user) return res.json({ success: true });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = await hashPassword(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordReset.upsert({
        where: { userId: user.id },
        create: { userId: user.id, tokenHash, expiresAt },
        update: { tokenHash, expiresAt },
      });

      const resetUrl = `${
        process.env.FRONTEND_URL ?? "http://localhost:5173"
      }/reset-password?token=${rawToken}&userId=${user.id}`;
      // This now uses Nodemailer's implementation:
      await sendEmail(
        user.email,
        "Password reset",
        `Reset your password: ${resetUrl}`
      );

      return res.json({ success: true });
    } catch (error: any) {
      console.error("requestPasswordReset error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/v1/auth/password-reset/confirm
  confirmPasswordReset: async (req: Request, res: Response) => {
    try {
      const { userId, token, newPassword } = req.body;
      if (!userId || !token || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const pr = await prisma.passwordReset.findUnique({ where: { userId } });
      if (!pr)
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      if (pr.expiresAt < new Date()) {
        // delete expired record
        await prisma.passwordReset
          .delete({ where: { userId } })
          .catch(() => {});
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      const ok = await comparePassword(token, pr.tokenHash);
      if (!ok)
        return res
          .status(400)
          .json({ success: false, message: "Invalid token" });

      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash, passwordSetAt: new Date() },
      });

      // remove token and revoke all sessions
      await prisma.passwordReset.delete({ where: { userId } });
      await prisma.session.updateMany({
        where: { userId },
        data: { revoked: true },
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("confirmPasswordReset error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // POST /api/v1/auth/change-password
  changePassword: async (req: Request, res: Response) => {
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
        payload = verifyAccessToken(token);
      } catch {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }

      const userId = payload.sub as string;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user || !user.passwordHash) {
        return res
          .status(400)
          .json({ success: false, message: "User has no password set" });
      }

      // verify old password
      const ok = await comparePassword(oldPassword, user.passwordHash);
      if (!ok) {
        return res
          .status(401)
          .json({ success: false, message: "Old password incorrect" });
      }

      // hash new password
      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash, passwordSetAt: new Date() },
      });

      // revoke all sessions (force logout everywhere)
      await prisma.session.updateMany({
        where: { userId },
        data: { revoked: true },
      });

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      console.error("changePassword error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
