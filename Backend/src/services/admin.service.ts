import { AppError } from "../errors/appError.js";
import { GlobalRole, UserStatus } from "../generated/prisma/enums.js";
import {
  findUserById,
  listAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../repositories/user.repository.js";

export const listUsersService = async () => {
  const users = await listAllUsers();

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    role: user.role,
    projectCount: user._count.projectMemberships,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};

export const updateUserStatusService = async (
  targetUserId: string,
  status: string,
  requesterId: string,
) => {
  if (!Object.values(UserStatus).includes(status as UserStatus)) {
    throw new AppError(400, "Invalid status value");
  }
  if (targetUserId === requesterId) {
    throw new AppError(400, "You cannot change your own status");
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    throw new AppError(404, "User not found");
  }

  const updated = await updateUserStatus(targetUserId, status as UserStatus);
  const { password, ...safeUser } = updated;
  return safeUser;
};

export const updateUserRoleService = async (
  targetUserId: string,
  role: string,
  requesterId: string,
) => {
  if (!Object.values(GlobalRole).includes(role as GlobalRole)) {
    throw new AppError(400, "Invalid role value");
  }
  if (targetUserId === requesterId) {
    throw new AppError(400, "You cannot change your own role");
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    throw new AppError(404, "User not found");
  }

  const updated = await updateUserRole(targetUserId, role as GlobalRole);
  const { password, ...safeUser } = updated;
  return safeUser;
};
