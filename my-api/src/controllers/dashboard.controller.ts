import type { Response } from "express";
import { asyncHandler, sendSuccess } from "@devsaini2300/backend-core";
import { TaskStatus, EnergyLevel } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { MomentumService } from "../services/momentum/momentum.service";
import { RecommendationService } from "../services/recommendation/recommendation.service";
import { prisma } from "../config/database";


export const getDashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const energyMode = (req.query.energy as EnergyLevel) || EnergyLevel.MEDIUM;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Fetch User Data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });

  // 2. Fetch Tasks
  const allTasks = await prisma.task.findMany({
    where: { userId },
    include: {
      project: true,
      subtasks: true,
      tags: { include: { tag: true } },
      dependencies: { include: { dependsOn: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch Today's Focus Sessions
  const focusSessionsToday = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: startOfDay },
      completed: true,
    },
  });

  const totalFocusSecondsToday = focusSessionsToday.reduce((acc, s) => acc + s.duration, 0);
  const focusMinutesToday = Math.round(totalFocusSecondsToday / 60);

  // Today's completion stats
  const tasksDueToday = allTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).toDateString() === now.toDateString()
  );

  const completedToday = allTasks.filter(
    (t) => t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString()
  ).length;

  const totalTodayCount = Math.max(tasksDueToday.length, completedToday, 1);
  const progressPercent = Math.min(100, Math.round((completedToday / totalTodayCount) * 100));

  // 4. Calculate Overall Momentum Score
  const momentumScore = MomentumService.calculateUserMomentum({
    completedToday,
    totalTodayPlanned: totalTodayCount,
    focusMinutesToday,
    streakDays: user?.streak || 0,
  });

  // 5. "What's Next?" Recommendation
  const recommendation = RecommendationService.recommendNextTask(allTasks, energyMode);

  // 6. Needs Attention (Overdue, Blocked, Neglected)
  const overdueTasks = allTasks.filter(
    (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.ARCHIVED && t.dueDate && new Date(t.dueDate) < startOfDay
  );

  const blockedTasks = allTasks.filter(
    (t) => t.status === TaskStatus.BLOCKED
  );

  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const neglectedTasks = allTasks.filter(
    (t) =>
      t.status === TaskStatus.TODO &&
      new Date(t.updatedAt) < threeDaysAgo &&
      !overdueTasks.some((ot) => ot.id === t.id)
  );

  // 7. Quick Wins (<= 15 minutes)
  const quickWins = allTasks.filter(
    (t) =>
      t.status !== TaskStatus.COMPLETED &&
      t.status !== TaskStatus.ARCHIVED &&
      t.status !== TaskStatus.BLOCKED &&
      t.estimatedMinutes <= 15
  );

  sendSuccess(res, {
    user,
    momentumScore,
    focusNow: {
      task: recommendation.task,
      reasons: recommendation.reasons,
      score: recommendation.score,
    },
    todayProgress: {
      completed: completedToday,
      total: totalTodayCount,
      percent: progressPercent,
      focusMinutes: focusMinutesToday,
    },
    needsAttention: {
      overdue: overdueTasks,
      blocked: blockedTasks,
      neglected: neglectedTasks,
      count: overdueTasks.length + blockedTasks.length + neglectedTasks.length,
    },
    quickWins,
  });
});
