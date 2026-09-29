import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SESSION_SECRET: string | undefined = process.env.SESSION_SECRET;

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  try {
    if (!header || !SESSION_SECRET) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }
    // works with both "Bearer <token>" and the raw token
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    const decoded = jwt.verify(token, SESSION_SECRET) as jwt.JwtPayload;
    req.userID = decoded.id as string;
    next();
  } catch (e: unknown) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
