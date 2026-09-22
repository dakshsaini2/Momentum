import { Task, TaskStatus, Priority } from "@prisma/client";

export interface TaskMomentumResult {
  score: number; // 0 to 100
  factors: {
    priorityScore: number;
    deadlineScore: number;
    progressScore: number;
    inactivityScore: number;
    blockingPenalty: number;
  };
}

export class MomentumService {
  /**
   * Calculates a momentum score (0 - 100) for an individual task.
   */
  public static calculateTaskMomentum(task: Task & { subtasks?: Task[] }): TaskMomentumResult {
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED) {
      return {
        score: 0,
        factors: { priorityScore: 0, deadlineScore: 0, progressScore: 0, inactivityScore: 0, blockingPenalty: 0 },
      };
    }

    let priorityScore = 0;
    switch (task.priority) {
      case Priority.URGENT:
        priorityScore = 25;
        break;
      case Priority.HIGH:
        priorityScore = 20;
        break;
      case Priority.MEDIUM:
        priorityScore = 12;
        break;
      case Priority.LOW:
        priorityScore = 5;
        break;
    }

    // Deadline proximity (max 35)
    let deadlineScore = 0;
    if (task.dueDate) {
      const now = new Date().getTime();
      const due = new Date(task.dueDate).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);

      if (diffHours < 0) {
        // Overdue! Maximum urgency surge
        deadlineScore = 35;
      } else if (diffHours <= 12) {
        deadlineScore = 32;
      } else if (diffHours <= 24) {
        deadlineScore = 28;
      } else if (diffHours <= 72) {
        deadlineScore = 20;
      } else if (diffHours <= 168) {
        deadlineScore = 10;
      } else {
        deadlineScore = 5;
      }
    }

    // Progress weight (max 20 pts)
    // Partially finished tasks have higher momentum inertia (sunk cost / near completion)
    const progressScore = Math.round((task.progress / 100) * 20);

    // Inactivity / Age weight (max 20 pts)
    // Neglected tasks gain momentum boost to avoid getting buried
    let inactivityScore = 0;
    const updatedAt = new Date(task.updatedAt).getTime();
    const hoursInactive = (new Date().getTime() - updatedAt) / (1000 * 60 * 60);

    if (hoursInactive >= 72) {
      inactivityScore = 20;
    } else if (hoursInactive >= 48) {
      inactivityScore = 15;
    } else if (hoursInactive >= 24) {
      inactivityScore = 10;
    } else {
      inactivityScore = 5;
    }

    // Blocking penalty (-30 pts if task is blocked)
    let blockingPenalty = 0;
    if (task.status === TaskStatus.BLOCKED) {
      blockingPenalty = -30;
    }

    const totalRaw = priorityScore + deadlineScore + progressScore + inactivityScore + blockingPenalty;
    const score = Math.max(0, Math.min(100, Math.round(totalRaw)));

    return {
      score,
      factors: {
        priorityScore,
        deadlineScore,
        progressScore,
        inactivityScore,
        blockingPenalty,
      },
    };
  }

  /**
   * Calculates overall daily user momentum score (0 - 100).
   * Combines today's completed task count, focus duration, active streak, and task velocity.
   */
  public static calculateUserMomentum(params: {
    completedToday: number;
    totalTodayPlanned: number;
    focusMinutesToday: number;
    streakDays: number;
  }): number {
    const { completedToday, totalTodayPlanned, focusMinutesToday, streakDays } = params;

    const completionRate = totalTodayPlanned > 0 ? Math.min(1, completedToday / totalTodayPlanned) : 0.5;
    const completionScore = completionRate * 40; // max 40

    // Focus score: target 60 mins focus per day for 30 pts
    const focusScore = Math.min(30, (focusMinutesToday / 60) * 30);

    // Streak bonus: max 15 pts (3 pts per day up to 5 days)
    const streakScore = Math.min(15, streakDays * 3);

    // Base active bonus: 15 pts if at least 1 task completed
    const activeBonus = completedToday > 0 ? 15 : 5;

    const score = Math.round(completionScore + focusScore + streakScore + activeBonus);
    return Math.max(0, Math.min(100, score));
  }
}
