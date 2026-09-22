import type { Response } from "express";
import { asyncHandler, sendSuccess } from "@devsaini2300/backend-core";
import { TaskStatus } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/database";


export const getDailyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let plan = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date: todayDate } },
  });

  if (!plan) {
    // Generate default morning plan from pending high priority tasks
    const pendingTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 6,
    });

    const timeSlots = ["09:00 AM", "10:15 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:45 PM"];
    const generatedSchedule = pendingTasks.map((t, idx) => ({
      time: timeSlots[idx] || "05:00 PM",
      taskId: t.id,
      title: t.title,
      duration: t.estimatedMinutes || 30,
      priority: t.priority,
    }));

    plan = await prisma.dailyPlan.create({
      data: {
        userId,
        date: todayDate,
        schedule: generatedSchedule,
      },
    });
  }

  sendSuccess(res, plan);
});

export const updateDailyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { schedule } = req.body;
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const plan = await prisma.dailyPlan.upsert({
    where: { userId_date: { userId, date: todayDate } },
    update: { schedule },
    create: { userId, date: todayDate, schedule },
  });

  sendSuccess(res, plan);
});

export const submitDailyReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { biggestWin, notes, carryForwardTaskIds } = req.body;

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);

  // Fetch today stats
  const allTasks = await prisma.task.findMany({ where: { userId } });
  const completedToday = allTasks.filter(
    (t) => t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString()
  ).length;

  const focusSessions = await prisma.focusSession.findMany({
    where: { userId, startedAt: { gte: todayDate } },
  });
  const focusMinutes = Math.round(focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60);

  // Save review
  const review = await prisma.dailyReview.upsert({
    where: { userId_date: { userId, date: todayDate } },
    update: {
      completedCount: completedToday,
      totalCount: allTasks.length,
      focusTime: focusMinutes,
      biggestWin: biggestWin || null,
      notes: notes || null,
    },
    create: {
      userId,
      date: todayDate,
      completedCount: completedToday,
      totalCount: allTasks.length,
      focusTime: focusMinutes,
      biggestWin: biggestWin || null,
      notes: notes || null,
    },
  });

  // Carry forward selected incomplete tasks to tomorrow
  if (Array.isArray(carryForwardTaskIds) && carryForwardTaskIds.length > 0) {
    await prisma.task.updateMany({
      where: { id: { in: carryForwardTaskIds }, userId },
      data: { dueDate: tomorrow },
    });
  }

  // Award XP for completing Daily Review (+20 XP)
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 20 } },
  });

  sendSuccess(res, review, 201);
});
