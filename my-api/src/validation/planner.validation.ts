import { z } from "zod";

export const updateDailyPlanSchema = z.object({
  schedule: z.array(z.object({
    time: z.string().max(20),
    taskId: z.string(),
    title: z.string().max(500),
    duration: z.number().int().min(1).max(480),
    priority: z.string().max(20).optional(),
  })).max(20, "Plan cannot exceed 20 items"),
});

export const submitDailyReviewSchema = z.object({
  biggestWin: z.string().max(1000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  carryForwardTaskIds: z.array(z.string()).max(50).optional(),
});
