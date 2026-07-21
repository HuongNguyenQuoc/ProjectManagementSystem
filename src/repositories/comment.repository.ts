import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const createComment = (data: Prisma.CommentUncheckedCreateInput) => {
  return prisma.comment.create({ data });
};

export const findCommentsByTaskId = (taskId: string) => {
  return prisma.comment.findMany({
    where: { taskId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
};