import { Router } from "express";
import { createTaskController, listTasksByProjectController, updateTaskController } from "../controllers/task.controller.js";
import commentRouter from "./comment.routes.js";

const taskRouter = Router({ mergeParams: true });

taskRouter.post("/", createTaskController);
taskRouter.get("/", listTasksByProjectController);
taskRouter.patch('/:taskId', updateTaskController);
taskRouter.use('/:taskId/comments', commentRouter);

export default taskRouter;