import { Router } from "express";
import { validate } from "@devsaini2300/backend-core";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getTasks,
  createTask,
  quickCaptureTask,
  getTaskById,
  updateTask,
  deleteTask,
  aiBreakdownTask,
} from "../controllers/tasks.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  quickCaptureSchema,
} from "../validation/task.validation";

const router = Router();

router.use(requireAuth);

router.get("/", getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.post("/quick", validate(quickCaptureSchema), quickCaptureTask);
router.get("/:id", getTaskById);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/breakdown", aiBreakdownTask);

export default router;
