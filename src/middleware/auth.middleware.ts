import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { sub: string; email: string; role: string; companyId: string };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: no access token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
      email: string;
      role: string;
      companyId: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Unauthorized: invalid or expired token" });
  }
}
