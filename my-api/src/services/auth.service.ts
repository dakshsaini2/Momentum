import {
  AppError,
  hashPassword,
  comparePassword,
} from "@devsaini2300/backend-core";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";

/**
 * Parse a duration string like '15m', '7d', '1h' to milliseconds.
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // 7 days default

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] ?? 1000);
}

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict("Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: (user as any).avatar || null,
        timezone: (user as any).timezone || "UTC",
        xp: (user as any).xp || 0,
        level: (user as any).level || 1,
        streak: (user as any).streak || 0,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: (user as any).avatar || null,
        timezone: (user as any).timezone || "UTC",
        xp: (user as any).xp || 0,
        level: (user as any).level || 1,
        streak: (user as any).streak || 0,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshTokenValue: string) {
    // Find the stored refresh token
    const storedToken =
      await userRepository.findRefreshToken(refreshTokenValue);

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    // Verify the JWT signature
    try {
      verifyRefreshToken(refreshTokenValue);
    } catch {
      throw AppError.unauthorized("Invalid refresh token");
    }

    // Revoke old refresh token (rotation)
    await userRepository.revokeRefreshToken(refreshTokenValue);

    // Generate new token pair
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.role,
    );

    return {
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
        avatar: (storedToken.user as any).avatar || null,
        timezone: (storedToken.user as any).timezone || "UTC",
        xp: (storedToken.user as any).xp || 0,
        level: (storedToken.user as any).level || 1,
        streak: (storedToken.user as any).streak || 0,
      },
      ...tokens,
    };
  }

  async logout(refreshTokenValue: string) {
    await userRepository.revokeRefreshToken(refreshTokenValue);
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: (user as any).avatar || null,
      timezone: (user as any).timezone || "UTC",
      xp: (user as any).xp || 0,
      level: (user as any).level || 1,
      streak: (user as any).streak || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateTokens(userId: string, role: string) {
    const jti = crypto.randomUUID();
    const accessToken = generateAccessToken({ sub: userId, role });
    const refreshTokenValue = generateRefreshToken({ sub: userId, role, jti } as any);

    const expiresAt = new Date(
      Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN),
    );
    await userRepository.createRefreshToken(
      userId,
      refreshTokenValue,
      expiresAt,
    );

    return { accessToken, refreshToken: refreshTokenValue };
  }
}

export const authService = new AuthService();
