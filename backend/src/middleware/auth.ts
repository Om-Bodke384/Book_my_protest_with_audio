import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, Role, TokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  try {
    const token = header.split(" ")[1];
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
