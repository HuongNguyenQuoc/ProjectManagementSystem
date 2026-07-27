import type { Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth.js";
import {
  addMemberToProjectService,
  createProjectService,
  getProjectDetailService,
  listProjectsService,
  updateProjectService,
  removeMemberFromProjectService
} from "../services/project.service.js";

export const createProjectController = async (
  req: AuthRequest,
  res: Response,
) => {
  const project = await createProjectService(req.body, req.userId as string);
  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
};

export const listProjectsController = async (
  _req: AuthRequest,
  res: Response,
) => {
  const projects = await listProjectsService();
  res.status(200).json({
    success: true,
    message: "Projects retrieved successfully",
    data: projects,
  });
};

export const addMemberToProjectController = async (
  req: AuthRequest,
  res: Response,
) => {
  const member = await addMemberToProjectService(
    req.params.projectId as string,
    req.body,
    req.userId as string,
  );
  res.status(200).json({
    success: true,
    message: "Member added to project successfully",
    data: member,
  });
};

export const getProjectByIdController = async (
  req: AuthRequest,
  res: Response,
) => {
  const project = await getProjectDetailService(
    req.params.projectId as string,
    req.userId as string,
  );
  res.status(200).json({
    success: true,
    message: "Project details retrieved successfully",
    data: project,
  });
};

export const updateProjectController = async (req: AuthRequest, res: Response) => {
  const updatedProject = await updateProjectService(req.params.projectId as string, req.body,
    req.userId as string);
  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: updatedProject,
  });
}

export const removeMemberFromProjectController = async (req: AuthRequest, res: Response) => {
  const removeMember = await removeMemberFromProjectService(req.params.projectId as string, req.params.userId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Member removed from project successfully",
    data: removeMember,
  });
};