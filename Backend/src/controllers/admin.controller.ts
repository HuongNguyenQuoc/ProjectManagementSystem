import type { Response } from "express";
import type { AuthRequest } from "../middlewares/requireAuth.js";
import {
  listUsersService,
  updateUserRoleService,
  updateUserStatusService,
} from "../services/admin.service.js";

export const listUsersController = async (req: AuthRequest, res: Response) => {
  const users = await listUsersService();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
};

export const updateUserStatusController = async (req: AuthRequest, res: Response) => {
  const user = await updateUserStatusService(
    req.params.userId as string,
    req.body.status,
    req.userId as string,
  );
  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: user,
  });
};

export const updateUserRoleController = async (req: AuthRequest, res: Response) => {
  const user = await updateUserRoleService(
    req.params.userId as string,
    req.body.role,
    req.userId as string,
  );
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
};
