import { prisma } from "../lib/prisma.js";
import type { GlobalRole, UserStatus } from "../generated/prisma/enums.js";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  return prisma.user.create({ data });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const listAllUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { projectMemberships: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserStatus = (userId: string, status: UserStatus) => {
  return prisma.user.update({ where: { id: userId }, data: { status } });
};

export const updateUserRole = (userId: string, role: GlobalRole) => {
  return prisma.user.update({ where: { id: userId }, data: { role } });
};
