import { Router } from "express";
import { createTaskController, listTasksByProjectController } from "../controllers/task.controller.js";

const taskRouter = Router({ mergeParams: true });

taskRouter.post("/", createTaskController);
taskRouter.get("/", listTasksByProjectController);

export default taskRouter;