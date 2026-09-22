import type { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "@devsaini2300/backend-core";
import { FocusFeedback } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/database";

export const logFocusSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  // Validated by Zod middleware
  const { taskId, durationSeconds, feedback, completed } = req.body;

  // Validate task ownership if taskId is provided
  if (taskId) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) {
      return sendError(res, "Task not found or not owned by you", 404, "NOT_FOUND");
    }
  }

  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

  const session = await prisma.focusSession.create({
    data: {
      userId,
      taskId: taskId || null,
      duration: durationSeconds,
      completed: completed !== undefined ? completed : true,
      feedback: (feedback as FocusFeedback) || FocusFeedback.NORMAL,
    },
    include: { task: true },
  });

  if (taskId) {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        actualMinutes: { increment: durationMinutes },
      },
    });
  }

  let xpAward = 15;
  if (feedback === FocusFeedback.DIFFICULT) xpAward += 10;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpAward },
    },
  });

  sendSuccess(res, { session, xpAwarded: xpAward }, 201);
});

export const getFocusHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;

  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    include: { task: { select: { id: true, title: true, priority: true } } },
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);

  sendSuccess(res, {
    sessions,
    totalMinutes: Math.round(totalSeconds / 60),
    totalSessions: sessions.length,
  });
});
