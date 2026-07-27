import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

export const createTask = (
  data: Prisma.TaskUncheckedCreateInput,
  client: DbClient = prisma,
) => {
  return client.task.create({ data });
};

export const addTaskAssignee = (
  data: Prisma.TaskAssigneeUncheckedCreateInput,
  client: DbClient = prisma,
) => {
  return client.taskAssignee.create({ data });
};

export const findTasksByProjectId = (projectId: string) => {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignees: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findTaskById = (taskId: string) => {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: { assignees: true },
  });
};

export const updateTask = (
  taskId: string,
  data: Prisma.TaskUncheckedUpdateInput,
) => {
  return prisma.task.update({
    where: { id: taskId },
    data,
  });
};
