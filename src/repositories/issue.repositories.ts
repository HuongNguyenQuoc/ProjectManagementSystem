import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export const createIssue = async (data: Prisma.IssueUncheckedCreateInput) => {
  return await prisma.issue.create({ data });
}

export const findIssuesByProjectId = async (projectId: string) => {
  return await prisma.issue.findMany({
    where: { projectId },
    include: {
      reporter: true,
      assignee: true,
      task: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findIssueByIdRepository = async (issueId: string) => {
  return await prisma.issue.findUnique({
    where: { id: issueId },
  });
};  

export const updateIssueRepository = async (issueId: string, data: Prisma.IssueUncheckedUpdateInput) => {
  return await prisma.issue.update({
    where: { id: issueId },
    data,
  });
};