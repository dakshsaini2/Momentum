import { Router } from "express";
import { validate } from "@devsaini2300/backend-core";
import { requireAuth } from "../middleware/auth.middleware";
import { logFocusSession, getFocusHistory } from "../controllers/focus.controller";
import { logFocusSessionSchema } from "../validation/focus.validation";

const router = Router();

router.use(requireAuth);
router.post("/session", validate(logFocusSessionSchema), logFocusSession);
router.get("/history", getFocusHistory);

export default router;
