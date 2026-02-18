import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../auth/utils";
import { sendEmail } from "../lib/email";

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
};

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

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
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

      // Fetch full user with role & company
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: { select: { roleName: true } },
          company: { select: { companyName: true } },
        },
      });

      if (!fullUser) {
        return res
          .status(500)
          .json({ success: false, message: "User creation failed" });
      }

      // Sign tokens
      const accessToken = signAccessToken(
        fullUser.id,
        fullUser.email,
        fullUser.role.roleName,
        fullUser.companyId,
      );

      const session = await prisma.session.create({
        data: {
          userId: fullUser.id,
          userAgent: req.get("user-agent") ?? null,
          ip: req.ip,
          expiresAt: new Date(
            Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      });

      const refreshToken = signRefreshToken(
        fullUser.id,
        fullUser.email,
        session.id,
        fullUser.role.roleName,
        fullUser.companyId,
      );

      const refreshTokenHash = await hashPassword(refreshToken);

      await prisma.session.update({
        where: { id: session.id },
        data: { refreshTokenHash },
      });

      // Set cookies
      res.cookie("refreshToken", refreshToken, refreshCookieOptions);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          companyId: fullUser.companyId,
          companyName: fullUser.company.companyName,
          roleId: fullUser.roleId,
          roleName: fullUser.role.roleName,
          passwordSetAt: fullUser.passwordSetAt,
        },
      });
    } catch (error: any) {
      console.error("Register error:", error);
      return res
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

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            select: {
              id: true,
              roleName: true,
            },
          },
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      });

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
      const accessToken = signAccessToken(
        user.id,
        user.email,
        user.role.roleName,
        user.companyId,
      );

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
      const refreshToken = signRefreshToken(
        user.id,
        user.email,
        session.id,
        user.role.roleName,
        user.companyId,
      );

      // 4. Store hashed refresh token in the session
      const refreshTokenHash = await hashPassword(refreshToken);
      await prisma.session.update({
        where: { id: session.id },
        data: { refreshTokenHash },
      });

      // 5. Set httpOnly cookie for refresh token
      res.cookie("refreshToken", refreshToken, refreshCookieOptions);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      // 6. Return response
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,

          companyId: user.companyId,
          companyName: user.company.companyName,

          roleId: user.roleId,
          roleName: user.role.roleName,

          passwordSetAt: user.passwordSetAt,
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
      if (!token)
        return res.status(401).json({ success: false, message: "No token" });

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
        session.refreshTokenHash,
      );
      if (!tokenMatches) {
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

      // get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, company: true },
      });
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      // create new session
      const newSession = await prisma.session.create({
        data: {
          userId,
          userAgent: req.get("user-agent") ?? null,
          ip: req.ip,
          expiresAt: new Date(
            Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      });

      // sign new tokens with full payload
      const newRefreshToken = signRefreshToken(
        userId,
        user.email,
        newSession.id,
        user.role.roleName,
        user.companyId,
      );

      const newAccessToken = signAccessToken(
        userId,
        user.email,
        user.role.roleName,
        user.companyId,
      );

      const newRefreshHash = await hashPassword(newRefreshToken);
      await prisma.session.update({
        where: { id: newSession.id },
        data: { refreshTokenHash: newRefreshHash },
      });

      res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      return res.json({ success: true });
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

      res
        .clearCookie("refreshToken", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        .clearCookie("accessToken", {
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
      const token =
        req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null);

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Missing token" });
      }

      let payload;
      try {
        payload = verifyAccessToken(token);
      } catch {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }

      const userId = payload.sub as string;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: {
            select: {
              companyName: true,
            },
          },
          role: {
            select: {
              roleName: true,
            },
          },
        },
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          companyId: user.companyId,
          companyName: user.company?.companyName ?? null,
          roleId: user.roleId,
          roleName: user.role?.roleName ?? null,
        },
      });
    } catch (error) {
      console.error("Me error:", error);
      return res
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

      const resetUrl = `${process.env.FRONTEND_URL}?token=${rawToken}&userId=${user.id}`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50; margin-bottom: 16px;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" 
              style="
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                font-weight: bold;
              ">
              Reset Password
            </a>
          </p>
          <p>This link is valid for 1 hour. If you didn’t request a password reset, you can safely ignore this email.</p>
          <p>Thank you,<br/>Virtual Services Group</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you’re having trouble clicking the button, copy and paste the URL below into your browser:</p>
          <p style="font-size: 12px; color: #555; word-break: break-all;">${resetUrl}</p>
        </div>
      `;

      await sendEmail(user.email, "Password Reset", html);

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
      const token =
        req.cookies.accessToken ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null);

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Missing token" });
      }

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

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      return res.json({
        success: true,
        message: "Password updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("changePassword error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
