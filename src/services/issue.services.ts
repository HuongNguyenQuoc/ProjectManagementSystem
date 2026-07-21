import { serialize } from "node:v8";
import { AppError } from "../errors/appError.js";
import { IssueSeverity } from "../generated/prisma/client.js";
import { createIssue, findIssuesByProjectId } from "../repositories/issue.repositories.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { findTaskById } from "../repositories/task.repository.js";
import { resolve } from "node:path";

interface CreateIssueInput {
  title: string;
  description: string;
  severity?: string;
  taskId?: string;
}

export const createIssueService = async (
  projectId: string,
  input: CreateIssueInput,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(403, "You are not belong to this project");
  }
  if (!input.title || !input.description) {
    throw new AppError(400, "Title and description are required");
  }
  if (input.severity !== undefined && !Object.values(IssueSeverity).includes(input.severity as IssueSeverity)) {
    throw new AppError(400, "Invalid severity value");
  }
  if (input.taskId) {
    const task = await findTaskById(input.taskId);
    if (!task || task.projectId !== projectId) {
      throw new AppError(400, "Task does not belong to the project");
    }
  }
  return createIssue({
    projectId, 
    taskId: input.taskId ?? null,
    title: input.title,
    description: input.description,
    severity: input.severity as IssueSeverity | undefined,
    reportedBy: requesterId,
  });
};

export const listIssuesByProjectService = async (projectId: string, requesterId: string) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(403, "You are not belong to this project");
  }
  
  const issues = await findIssuesByProjectId(projectId);

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    severity: issue.severity,
    status: issue.status,
    taskId: issue.taskId,
    taskTitle: issue.task?.title ?? null,
    reporterName: issue.reporter.fullName,
    assigneeName: issue.assignee?.fullName ?? null,
    resolvedAt: issue.resolvedAt,
    createdAt: issue.createdAt,
  }));
};