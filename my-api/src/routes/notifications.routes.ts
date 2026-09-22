import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getNotifications, markNotificationRead, getTags } from "../controllers/notifications.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.get("/tags", getTags);

export default router;
