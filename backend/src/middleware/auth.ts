import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

export const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtPayload = { userId: number };

export interface AuthRequest extends Request {
  authData?: JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.authData = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
