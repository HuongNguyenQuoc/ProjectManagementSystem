import { prisma } from "../lib/prisma.js";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ 
    where: { email }
  });
};

export const createUser = (data: {
  fullName: string;
  email: string;
  password: string
}) => {
  return prisma.user.create({ data });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
  });
};