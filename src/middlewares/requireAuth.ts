import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../../config/env.js";
import { AppError } from "../errors/appError.js";

export interface AuthRequest extends Request {
  userId?: string; // Optional userId property
}

export const requireAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[COOKIE_NAME as string];

  if (!token) {
    next(new AppError(401, "Authentication token is missing"));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as {
      userId: string;
    }; // If correct return the payload with userId
    req.userId = payload.userId; // Attach the userId to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};
