import { AppError } from "../errors/appError.js";
import { TaskPriority } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { findProjectMember } from "../repositories/project.repository.js";
import {
  addTaskAssignee,
  createTask,
  findTasksByProjectId,
} from "../repositories/task.repository.js";

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
}

export const createTaskService = async (
  projectId: string,
  input: CreateTaskInput,
  creatorId: string,
) => {
  if (!input.title) throw new AppError(400, "Task title is required");

  const requesterMembership = await findProjectMember(projectId, creatorId);
  if (
    !requesterMembership ||
    requesterMembership.projectRole !== "PROJECT_LEADER"
  ) {
    throw new AppError(
      403,
      "You are not authorized to create tasks in this project",
    );
  }

  if (input.assigneeId) {
    const assigneeMembership = await findProjectMember(
      projectId,
      input.assigneeId,
    );
    if (!assigneeMembership) {
      throw new AppError(400, "Assignee is not a member of this project");
    }
  }

  return prisma.$transaction(async (tx) => {
    const task = await createTask(
      {
        projectId,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority as TaskPriority | undefined,
        startDate: input.startDate ? new Date(input.startDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdBy: creatorId,
      },
      tx,
    );

    if (input.assigneeId) {
      await addTaskAssignee(
        {
          taskId: task.id,
          userId: input.assigneeId,
          assignedBy: creatorId,
        },
        tx,
      );
    }
    return task;
  });
};

export const listTasksByProjectService = async (
  projectId: string,
  requesterId: string,
) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(
      403,
      "You are not authorized to view tasks in this project",
    );
  }

  const tasks = await findTasksByProjectId(projectId);

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assigneeName: task.assignees[0]?.user?.fullName ?? null,
    startDate: task.startDate,
    dueDate: task.dueDate,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));
};
