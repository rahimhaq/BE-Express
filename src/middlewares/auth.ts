import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthUser { id: number; role: "USER"|"ADMIN"|"SUPPLIER"; email: string; }
declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const token = hdr.slice("Bearer ".length);
    const payload = verifyJwt<AuthUser>(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
