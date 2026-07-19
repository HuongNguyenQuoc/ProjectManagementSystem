import express, { Application, NextFunction, Request, Response } from "express";
import { AppError } from "./errors/appError.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Project Management System API",
  });
});

app.use("/api/auth", authRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

export default app;
