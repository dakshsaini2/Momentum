import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Name too long"),
  description: z.string().max(2000, "Description too long").optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
  icon: z.string().max(50).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Name too long").optional(),
  description: z.string().max(2000, "Description too long").optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
  icon: z.string().max(50).optional(),
}).strict();  // Reject unknown fields — prevents userId/id injection
