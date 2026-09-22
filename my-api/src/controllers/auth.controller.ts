import type { Request, Response } from "express";
import { asyncHandler, sendSuccess } from "@devsaini2300/backend-core";
import { authService } from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };
  const result = await authService.register(name, email, password);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  sendSuccess(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const result = await authService.refreshToken(refreshToken);
  sendSuccess(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  await authService.logout(refreshToken);
  sendSuccess(res, { message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await authService.getMe(userId);
  sendSuccess(res, result);
});
