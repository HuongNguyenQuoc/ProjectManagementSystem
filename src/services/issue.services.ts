import { AppError } from "../errors/appError.js";
import { IssueSeverity, IssueStatus } from "../generated/prisma/client.js";
import {
  createIssue,
  findIssueByIdRepository,
  findIssuesByProjectId,
  updateIssueRepository,
} from "../repositories/issue.repositories.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { findTaskById } from "../repositories/task.repository.js";

interface CreateIssueInput {
  title: string;
  description: string;
  severity?: string;
  taskId?: string;
}

interface UpdateIssueInput {
  status?: string;
  severity?: string;
  assignedTo?: string;
}

export const updateIssueService = async (
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (
    !requesterMembership ||
    requesterMembership.projectRole !== "PROJECT_LEADER"
  ) {
    throw new AppError(
      403,
      "You are not authorized to update issues in this project",
    );
  }

  if (
    input.status !== undefined &&
    !Object.values(IssueStatus).includes(input.status as IssueStatus)
  ) {
    throw new AppError(400, "Invalid status value");
  }
  if (
    input.severity !== undefined &&
    !Object.values(IssueSeverity).includes(input.severity as IssueSeverity)
  ) {
    throw new AppError(400, "Invalid severity value");
  }

  const issue = await findIssueByIdRepository(issueId);
  if (!issue || issue.projectId !== projectId) {
    throw new AppError(404, "Issue not found in this project");
  }

  if (input.assignedTo) {
    const assigneeMembership = await findProjectMember(
      projectId,
      input.assignedTo,
    );
    if (!assigneeMembership) {
      throw new AppError(400, "Assignee is not a member of this project");
    }
  }

  const isResolvingStatus =
    input.status === "RESOLVED" || input.status === "CLOSED";

  return updateIssueRepository(issueId, {
    ...(input.status !== undefined && { status: input.status as IssueStatus }),
    ...(input.severity !== undefined && {
      severity: input.severity as IssueSeverity,
    }),
    ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
    ...(input.status !== undefined && {
      resolvedAt: isResolvingStatus ? new Date() : null,
    }),
  });
};

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
  if (
    input.severity !== undefined &&
    !Object.values(IssueSeverity).includes(input.severity as IssueSeverity)
  ) {
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

export const listIssuesByProjectService = async (
  projectId: string,
  requesterId: string,
) => {
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
