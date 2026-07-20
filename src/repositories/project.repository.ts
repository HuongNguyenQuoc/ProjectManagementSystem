import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

export const createProject = (
  data: Prisma.ProjectUncheckedCreateInput,
  client: DbClient = prisma
) => {
  return client.project.create({ data });
};

export const addProjectMember = (
  data: Prisma.ProjectMemberUncheckedCreateInput,
  client: DbClient = prisma
) => {
  return client.projectMember.create({ data });
};

export const findProjectById = (projectId: string) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } },
      tasks: true,
    }
  });
};

export const findAllProjectsWithStats = () => {
  return prisma.project.findMany({
    include: {
      members: {
        where: { projectRole: "PROJECT_LEADER" },
        include: {
          user: true,
        }
      },
      tasks: {
        select: { status: true },
      },
    },
    orderBy: {
      createdAt: "desc"
    },
  });
};

export const findProjectMember = (projectId: string, userId: string) => {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

export const updateProject = (
  projectId: string,
  data: Prisma.ProjectUpdateInput,
) => {
  return prisma.project.update({
    where: { id: projectId },
    data,
  });
};