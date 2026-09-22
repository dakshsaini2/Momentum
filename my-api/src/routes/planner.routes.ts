import { Router } from "express";
import { validate } from "@devsaini2300/backend-core";
import { requireAuth } from "../middleware/auth.middleware";
import { getDailyPlan, updateDailyPlan, submitDailyReview } from "../controllers/planner.controller";
import { updateDailyPlanSchema, submitDailyReviewSchema } from "../validation/planner.validation";

const router = Router();

router.use(requireAuth);
router.get("/plan", getDailyPlan);
router.put("/plan", validate(updateDailyPlanSchema), updateDailyPlan);
router.post("/review", validate(submitDailyReviewSchema), submitDailyReview);

export default router;
