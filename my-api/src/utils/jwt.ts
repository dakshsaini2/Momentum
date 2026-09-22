import {
  generateAccessToken as coreGenerateAccessToken,
  verifyAccessToken as coreVerifyAccessToken,
  verifyRefreshToken as coreVerifyRefreshToken,
} from "@devsaini2300/backend-core";
import type { JwtPayload } from "@devsaini2300/backend-core";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function generateAccessToken(payload: JwtPayload): string {
  return coreGenerateAccessToken(
    payload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );
}

export function generateRefreshToken(payload: JwtPayload & { jti?: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return coreVerifyAccessToken(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): JwtPayload {
  return coreVerifyRefreshToken(token, env.JWT_REFRESH_SECRET);
}
