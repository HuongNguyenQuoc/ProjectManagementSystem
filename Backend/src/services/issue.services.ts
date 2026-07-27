import { AppError } from "../errors/appError.js";
import { IssueSeverity, IssueStatus, Prisma } from "../generated/prisma/client.js";
import {
  createIssue,
  deleteIssueRepository,
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
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  assignedTo?: string;
}

/**
 * Leader: everything (title/description, status, severity, assignee).
 * Reporter (non-leader): title/description only, and only while the issue
 * is still OPEN/IN_PROGRESS — once a leader resolves/closes it, the report
 * is locked for the reporter. Status/severity/assignee are leader-only.
 */
export const updateIssueService = async (
  projectId: string,
  issueId: string,
  input: UpdateIssueInput,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(
      403,
      "You are not authorized to update issues in this project",
    );
  }

  const issue = await findIssueByIdRepository(issueId);
  if (!issue || issue.projectId !== projectId) {
    throw new AppError(404, "Issue not found in this project");
  }

  const isLeader = requesterMembership.projectRole === "PROJECT_LEADER";
  const isReporter = issue.reportedBy === requesterId;

  if (!isLeader && !isReporter) {
    throw new AppError(403, "You are not authorized to update this issue");
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
  if (input.assignedTo) {
    const assigneeMembership = await findProjectMember(
      projectId,
      input.assignedTo,
    );
    if (!assigneeMembership) {
      throw new AppError(400, "Assignee is not a member of this project");
    }
  }

  const data: Prisma.IssueUncheckedUpdateInput = {};

  if (input.title !== undefined || input.description !== undefined) {
    const isLocked =
      !isLeader && (issue.status === "RESOLVED" || issue.status === "CLOSED");
    if (isLocked) {
      throw new AppError(400, "Cannot edit a resolved or closed issue");
    }
    if (input.title !== undefined) {
      if (!input.title.trim()) throw new AppError(400, "Title cannot be empty");
      data.title = input.title;
    }
    if (input.description !== undefined) {
      if (!input.description.trim()) {
        throw new AppError(400, "Description cannot be empty");
      }
      data.description = input.description;
    }
  }

  if (isLeader) {
    if (input.status !== undefined) {
      data.status = input.status as IssueStatus;
      data.resolvedAt =
        input.status === "RESOLVED" || input.status === "CLOSED"
          ? new Date()
          : null;
    }
    if (input.severity !== undefined) {
      data.severity = input.severity as IssueSeverity;
    }
    if (input.assignedTo !== undefined) {
      data.assignedTo = input.assignedTo;
    }
  }

  return updateIssueRepository(issueId, data);
};

/** Leader may delete any issue in the project; a reporter may delete their own. */
export const deleteIssueService = async (
  projectId: string,
  issueId: string,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(
      403,
      "You are not authorized to delete issues in this project",
    );
  }

  const issue = await findIssueByIdRepository(issueId);
  if (!issue || issue.projectId !== projectId) {
    throw new AppError(404, "Issue not found in this project");
  }

  const isLeader = requesterMembership.projectRole === "PROJECT_LEADER";
  const isReporter = issue.reportedBy === requesterId;

  if (!isLeader && !isReporter) {
    throw new AppError(403, "You are not authorized to delete this issue");
  }

  return deleteIssueRepository(issueId);
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
    reporterId: issue.reportedBy,
    reporterName: issue.reporter.fullName,
    assigneeId: issue.assignedTo,
    assigneeName: issue.assignee?.fullName ?? null,
    resolvedAt: issue.resolvedAt,
    createdAt: issue.createdAt,
  }));
};
