import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { GlobalRole, UserStatus } from "../generated/prisma/enums.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = (data: {
  fullName: string;
  email: string;
  password: string;
  status: UserStatus;
}) => {
  return prisma.user.create({ data });
};

/** OAuth-only accounts have no password. Accepts a transaction client so it can be paired with `createOAuthAccount` atomically. */
export const createOAuthUser = (
  data: { fullName: string; email: string },
  client: DbClient = prisma,
) => {
  return client.user.create({ data: { ...data, password: null } });
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

export const setVerificationCode = (
  userId: string, 
  data: { code: string; expiresAt: Date },
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { verificationCode: data.code, verificationCodeExpiresAt: data.expiresAt },
  });
};

export const activeUser = (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", verificationCode: null, verificationCodeExpiresAt: null },
  });
};
