import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "@devsaini2300/backend-core";
import { env } from "../config/env";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    sub?: string;
    role?: string;
  };
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // x-demo-user-id is ONLY allowed in development mode for local testing
      if (env.NODE_ENV === "development") {
        const demoHeader = req.headers["x-demo-user-id"] as string;
        if (demoHeader) {
          (req as any).user = { id: demoHeader, role: "USER" };
          return next();
        }
      }
      return sendError(res, "Access token is missing or invalid", 401, "AUTHENTICATION_REQUIRED");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(res, "Access token is missing", 401, "AUTHENTICATION_REQUIRED");
    }

    // Use the validated env config — no hardcoded fallback
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub?: string; id?: string; role?: string };

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return sendError(res, "Token user payload is missing", 401, "INVALID_TOKEN");
    }

    (req as any).user = { id: userId, sub: userId, role: decoded.role || "USER" };
    next();
  } catch {
    return sendError(res, "Invalid or expired access token", 401, "INVALID_TOKEN");
  }
}
