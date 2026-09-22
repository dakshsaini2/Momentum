import { z } from "zod";

export const logFocusSessionSchema = z.object({
  taskId: z.string().optional().nullable(),
  durationSeconds: z.number().int().min(1, "Duration must be at least 1 second").max(86400, "Duration cannot exceed 24 hours"),
  feedback: z.enum(["EASY", "NORMAL", "DIFFICULT", "BLOCKED"]).optional(),
  completed: z.boolean().optional(),
});
