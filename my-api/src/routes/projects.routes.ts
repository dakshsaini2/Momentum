import { Router } from "express";
import { validate } from "@devsaini2300/backend-core";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projects.controller";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validation/project.validation";

const router = Router();

router.use(requireAuth);

router.get("/", getProjects);
router.post("/", validate(createProjectSchema), createProject);
router.get("/:id", getProjectById);
router.patch("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);

export default router;
