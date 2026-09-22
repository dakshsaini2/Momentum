import { prisma } from "../config/database";
import type { Prisma } from "@prisma/client";
import crypto from "crypto";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  // ── Refresh Token Methods ──────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return prisma.refreshToken.create({
      data: {
        hashedToken,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return prisma.refreshToken.updateMany({
      where: { hashedToken },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async deleteExpiredRefreshTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

export const userRepository = new UserRepository();
