import express, { Application, NextFunction, Request, Response } from "express";
import { AppError } from "./errors/appError.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Project Management System API",
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

export default app;
