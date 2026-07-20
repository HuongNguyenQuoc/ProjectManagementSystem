import express from "express";
import { AppError } from "./errors/appError.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import projectRouter from "./routes/project.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the Project Management System API",
    });
});
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use((req, _res, next) => {
    next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map