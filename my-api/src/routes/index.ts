import { Router } from "express";
import { sendSuccess } from "@devsaini2300/backend-core";
import authRoutes from "./auth.routes";
import taskRoutes from "./tasks.routes";
import projectRoutes from "./projects.routes";
import dashboardRoutes from "./dashboard.routes";
import focusRoutes from "./focus.routes";
import plannerRoutes from "./planner.routes";
import analyticsRoutes from "./analytics.routes";
import notificationRoutes from "./notifications.routes";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    appName: "Momentum Intelligent Productivity OS",
    timestamp: new Date().toISOString(),
  });
});

// API Module Routes
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/projects", projectRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/focus", focusRoutes);
router.use("/planner", plannerRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationRoutes);

export default router;
