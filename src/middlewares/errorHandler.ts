import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";
import { Prisma } from "../generated/prisma/client.js";
import { NODE_ENV } from "../../config/env.js";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Unique constraint failed. Duplicate value exists."
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found."
      });
      return;
    }
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" :
    err instanceof Error ? err.message : "An unexpected error occurred.",
  });
}