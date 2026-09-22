import type { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "@devsaini2300/backend-core";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/database";


export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  sendSuccess(res, { notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) {
    return sendError(res, "Notification not found", 404, "NOT_FOUND");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  sendSuccess(res, updated);
});

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;

  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  sendSuccess(res, tags);
});
