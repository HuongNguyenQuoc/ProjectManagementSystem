import type { NextFunction, Response } from "express";
import { AppError } from "../errors/appError.js";
import type { GlobalRole } from "../generated/prisma/enums.js";
import type { AuthRequest } from "./requireAuth.js";

export const requireRole =
  (...roles: GlobalRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
