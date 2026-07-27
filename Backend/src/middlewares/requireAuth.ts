import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../../config/env.js";
import { AppError } from "../errors/appError.js";
import type { GlobalRole } from "../generated/prisma/enums.js";
import { findUserById } from "../repositories/user.repository.js";

export interface AuthRequest extends Request {
  userId?: string; // Optional userId property
  userRole?: GlobalRole;
}

export const requireAuth = async (
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

    // Role/status are not embedded in the JWT (7-day expiry) so a demoted
    // admin or a newly-blocked user is denied on their very next request,
    // not only after the token itself expires.
    const user = await findUserById(payload.userId);
    if (!user) {
      next(new AppError(401, "Invalid or expired authentication token"));
      return;
    }
    if (user.status !== "ACTIVE") {
      next(new AppError(403, "Account is not active"));
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    next(new AppError(401, "Invalid or expired authentication token"));
  }
};
