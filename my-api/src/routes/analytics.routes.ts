import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getAnalytics);

export default router;
