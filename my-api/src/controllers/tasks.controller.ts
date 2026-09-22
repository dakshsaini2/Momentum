import type { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "@devsaini2300/backend-core";
import { TaskStatus, Priority, EnergyLevel } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { QuickCaptureService } from "../services/parser/quickCapture.service";
import { AIBreakdownService } from "../services/ai/aiBreakdown.service";
import { prisma } from "../config/database";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const { projectId, status, priority, search } = req.query;

  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;

  const whereClause: any = { userId };

  if (projectId && typeof projectId === "string") whereClause.projectId = projectId;
  if (status && typeof status === "string") whereClause.status = status as TaskStatus;
  if (priority && typeof priority === "string") whereClause.priority = priority as Priority;

  if (search && typeof search === "string") {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: whereClause,
      include: {
        project: true,
        subtasks: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        dependencies: { include: { dependsOn: true } },
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.task.count({ where: whereClause }),
  ]);

  sendSuccess(res, {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  // Validated by Zod middleware — only whitelisted fields exist
  const {
    title,
    description,
    status,
    priority,
    energyLevel,
    dueDate,
    estimatedMinutes,
    projectId,
    parentTaskId,
  } = req.body;

  // Verify project ownership if projectId is provided
  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      return sendError(res, "Project not found or not owned by you", 404, "NOT_FOUND");
    }
  }

  // Verify parent task ownership if parentTaskId is provided
  if (parentTaskId) {
    const parentTask = await prisma.task.findFirst({ where: { id: parentTaskId, userId } });
    if (!parentTask) {
      return sendError(res, "Parent task not found or not owned by you", 404, "NOT_FOUND");
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || TaskStatus.TODO,
      priority: priority || Priority.MEDIUM,
      energyLevel: energyLevel || EnergyLevel.MEDIUM,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedMinutes: estimatedMinutes || 30,
      userId,
      projectId: projectId || null,
      parentTaskId: parentTaskId || null,
    },
    include: {
      project: true,
      subtasks: true,
      tags: { include: { tag: true } },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 5 } },
  });

  sendSuccess(res, task, 201);
});

export const quickCaptureTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  // Validated by Zod middleware
  const { command } = req.body;

  const parsed = QuickCaptureService.parseCommand(command);

  let targetProjectId: string | null = null;
  if (parsed.projectName) {
    const existingProject = await prisma.project.findFirst({
      where: { userId, name: { equals: parsed.projectName, mode: "insensitive" } },
    });
    if (existingProject) {
      targetProjectId = existingProject.id;
    }
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.title,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      estimatedMinutes: parsed.estimatedMinutes,
      userId,
      projectId: targetProjectId,
    },
    include: {
      project: true,
      tags: { include: { tag: true } },
    },
  });

  sendSuccess(res, task, 201);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: {
      project: true,
      subtasks: { orderBy: { createdAt: "asc" } },
      tags: { include: { tag: true } },
      dependencies: { include: { dependsOn: true } },
      dependents: { include: { task: true } },
    },
  });

  if (!task) {
    return sendError(res, "Task not found", 404, "NOT_FOUND");
  }

  sendSuccess(res, task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  // Validated by Zod .strict() schema — only whitelisted fields
  const {
    title,
    description,
    status,
    priority,
    energyLevel,
    dueDate,
    estimatedMinutes,
    progress,
    projectId,
    parentTaskId,
    blockedReason,
    blockedNote,
  } = req.body;

  const existingTask = await prisma.task.findFirst({ where: { id, userId } });
  if (!existingTask) {
    return sendError(res, "Task not found", 404, "NOT_FOUND");
  }

  // Verify project ownership if changing projectId
  if (projectId !== undefined && projectId !== null) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      return sendError(res, "Project not found or not owned by you", 404, "NOT_FOUND");
    }
  }

  // Verify parent task ownership if changing parentTaskId
  if (parentTaskId !== undefined && parentTaskId !== null) {
    const parentTask = await prisma.task.findFirst({ where: { id: parentTaskId, userId } });
    if (!parentTask) {
      return sendError(res, "Parent task not found or not owned by you", 404, "NOT_FOUND");
    }
  }

  // Build explicit update data — NO spreading of req.body
  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (energyLevel !== undefined) updateData.energyLevel = energyLevel;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
  if (progress !== undefined) updateData.progress = progress;
  if (projectId !== undefined) updateData.projectId = projectId;
  if (parentTaskId !== undefined) updateData.parentTaskId = parentTaskId;
  if (blockedReason !== undefined) updateData.blockedReason = blockedReason;
  if (blockedNote !== undefined) updateData.blockedNote = blockedNote;

  // Handle completion logic
  let completedAt = existingTask.completedAt;
  let xpBonus = 0;

  if (status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
    completedAt = new Date();
    xpBonus = existingTask.priority === Priority.URGENT ? 25 : existingTask.priority === Priority.HIGH ? 20 : 10;
  } else if (status && status !== TaskStatus.COMPLETED) {
    completedAt = null;
  }

  updateData.completedAt = completedAt;

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: true,
      subtasks: true,
      tags: { include: { tag: true } },
    },
  });

  if (xpBonus > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpBonus } },
    });
  }

  sendSuccess(res, updatedTask);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return sendError(res, "Task not found", 404, "NOT_FOUND");
  }

  await prisma.task.delete({ where: { id } });
  res.status(204).send();
});

export const aiBreakdownTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const id = req.params.id as string;

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return sendError(res, "Task not found", 404, "NOT_FOUND");
  }

  const subtaskItems = await AIBreakdownService.breakdownTask(task.title, task.description);

  const createdSubtasks = await Promise.all(
    subtaskItems.map((item) =>
      prisma.task.create({
        data: {
          title: item.title,
          estimatedMinutes: item.estimatedMinutes,
          parentTaskId: task.id,
          userId,
          projectId: task.projectId,
        },
      })
    )
  );

  sendSuccess(res, createdSubtasks, 201);
});
