import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  projectId: z.string().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long").optional(),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  energyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  projectId: z.string().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  blockedReason: z.enum([
    "WAITING_FOR_PERSON", "WAITING_FOR_API", "TECHNICAL_ISSUE",
    "NEED_INFORMATION", "DEPENDENCY", "OTHER",
  ]).optional().nullable(),
  blockedNote: z.string().max(1000).optional().nullable(),
}).strict();  // .strict() rejects unknown fields — mass assignment prevention

export const quickCaptureSchema = z.object({
  command: z.string().min(1, "Command string is required").max(1000, "Command too long"),
});
