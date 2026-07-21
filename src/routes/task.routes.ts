import { Router } from "express";
import { createTaskController, listTasksByProjectController, updateTaskController } from "../controllers/task.controller.js";

const taskRouter = Router({ mergeParams: true });

taskRouter.post("/", createTaskController);
taskRouter.get("/", listTasksByProjectController);
taskRouter.patch('/:taskId', updateTaskController);

export default taskRouter;