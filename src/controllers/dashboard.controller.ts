import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import { getProjectDetailService } from "../services/project.service.js";
import { getProjectDashboardService } from "../services/dashboard.service.js";

export const getProjectDetailController = async (req: AuthRequest, res: Response) => {
  const dashboardData = await getProjectDetailService(req.params.projectId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Project detail retrieved successfully",
    data: dashboardData
  });
};

export const getProjectDashboardController = async (req: AuthRequest, res: Response) => {
  const dashboard = await getProjectDashboardService(req.params.projectId as string, req.userId as string);
  res.status(200).json({
    success: true,
    message: "Project dashboard retrieved successfully",
    data: dashboard,
  });
};