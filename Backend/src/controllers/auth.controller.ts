import type { Request, Response } from "express";
import { COOKIE_NAME } from "../../config/env.js";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  resendVerificationCode,
  verifyEmail,
} from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const { user, token } = await loginUser(req.body);

  res.cookie(COOKIE_NAME as string, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: { user }, // No return token more because it is stored in the cookie
  });
};

export const logoutController = (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME as string);
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const meController = async (req: AuthRequest, res: Response) => {
  const user = await getCurrentUser(req.userId as string);
  res.status(200).json({
    success: true,
    message: "Current user",
    data: user,
  });
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { user, token } = await verifyEmail(req.body);

  res.cookie(COOKIE_NAME as string, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: { user },
  });
};

export const resendVerificationController = async (
  req: Request,
  res: Response,
) => {
  await resendVerificationCode(req.body);
  res.status(200).json({
    success: true,
    message: "Verification code resent",
  });
};
