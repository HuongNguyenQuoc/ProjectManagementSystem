import type { Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { createProjectService, listProjectsService } from "../services/project.service.js";

export const createProjectController = async (req: AuthRequest, res: Response) => {
  const project = await createProjectService(req.body, req.userId as string);
  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
};

export const listProjectsController = async (_req: AuthRequest, res: Response) => {
  const projects = await listProjectsService();
  res.status(200).json({
    success: true,
    message: "Projects retrieved successfully",
    data: projects,
  });
};