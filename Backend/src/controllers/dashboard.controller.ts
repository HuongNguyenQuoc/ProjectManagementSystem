import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import { getProjectDashboardService } from "../services/dashboard.service.js";

export const getProjectDashboardController = async (
  req: AuthRequest,
  res: Response,
) => {
  const dashboard = await getProjectDashboardService(
    req.params.projectId as string,
    req.userId as string,
  );
  res.status(200).json({
    success: true,
    message: "Project dashboard retrieved successfully",
    data: dashboard,
  });
};
