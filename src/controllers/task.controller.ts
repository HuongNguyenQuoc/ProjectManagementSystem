import { Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { createTaskService, listTasksByProjectService, updateTaskService } from "../services/task.service.js";

export const createTaskController = async (req: AuthRequest, res: Response) => {
  const task = await createTaskService(req.params.projectId as string, req.body, req.userId as string);
  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
};

export const listTasksByProjectController = async (req: AuthRequest, res: Response) => {
  const tasks = await listTasksByProjectService(req.params.projectId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Tasks retrieved successfully",
    data: tasks,
  });
};

export const updateTaskController = async (req: AuthRequest, res: Response) => {
  const task = await updateTaskService(
    req.params.taskId as string,
    req.body,
    req.userId as string,
    req.params.projectId as string
  );
  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
};
