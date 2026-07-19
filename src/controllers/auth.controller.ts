import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import { COOKIE_NAME, EXPIRES_IN } from "../../config/env.js";

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
    maxAge: Number(EXPIRES_IN)
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
