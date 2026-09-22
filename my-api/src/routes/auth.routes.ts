import { Router } from "express";
import { validate, authenticate } from "@devsaini2300/backend-core";
import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validation/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", validate(refreshTokenSchema), logout);
router.get("/me", authenticate, me);

export default router;
