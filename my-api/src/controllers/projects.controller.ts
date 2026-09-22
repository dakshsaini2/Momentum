import type { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "@devsaini2300/backend-core";
import { TaskStatus } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/database";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
          priority: true,
          estimatedMinutes: true,
          actualMinutes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = projects.map((p) => {
    const totalTasks = p.tasks.length;
    const completedTasks = p.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalFocusMinutes = p.tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

    return {
      ...p,
      taskCount: totalTasks,
      completedTaskCount: completedTasks,
      progress,
      totalFocusMinutes,
    };
  });

  sendSuccess(res, formatted);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  // Validated by Zod middleware — only name, description, color, icon
  const { name, description, color, icon } = req.body;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color: color || "#6366f1",
      icon: icon || "folder",
      userId,
    },
  });

  sendSuccess(res, project, 201);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      tasks: {
        include: { subtasks: true, tags: { include: { tag: true } } },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      },
    },
  });

  if (!project) {
    return sendError(res, "Project not found", 404, "NOT_FOUND");
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  sendSuccess(res, {
    ...project,
    taskCount: totalTasks,
    completedTaskCount: completedTasks,
    progress,
  });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) {
    return sendError(res, "Project not found", 404, "NOT_FOUND");
  }

  // Validated by Zod .strict() — only name, description, color, icon allowed
  // Build explicit update data — NO spreading of req.body
  const { name, description, color, icon } = req.body;
  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (icon !== undefined) updateData.icon = icon;

  const updated = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  sendSuccess(res, updated);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) {
    return sendError(res, "Project not found", 404, "NOT_FOUND");
  }

  await prisma.project.delete({ where: { id } });
  res.status(204).send();
});
