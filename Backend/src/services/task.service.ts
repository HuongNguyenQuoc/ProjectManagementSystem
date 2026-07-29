import { AppError } from "../errors/appError.js";
import { Prisma } from "../generated/prisma/client.js";
import { TaskPriority, TaskStatus, type GlobalRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { getProjectAccess } from "./projectAccess.js";
import {
  addTaskAssignee,
  createTask,
  findTasksByProjectId,
  findTaskById,
  findTaskWithAssigneeById,
  updateTask
} from "../repositories/task.repository.js";
import { emitTaskCreated, emitTaskUpdated } from "../lib/socket.js";

export interface TaskListItemDto {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assigneeId: string | null;
  assigneeName: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const toTaskListItem = (task: {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  startDate: Date | null;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignees: { userId: string; user: { fullName: string } }[];
}): TaskListItemDto => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  progress: task.progress,
  assigneeId: task.assignees[0]?.userId ?? null,
  assigneeName: task.assignees[0]?.user?.fullName ?? null,
  startDate: task.startDate,
  dueDate: task.dueDate,
  createdBy: task.createdBy,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
}

interface UpdateTaskInput {
  status?: string;
  progress?: number;
  startDate?: string;
  dueDate?: string;
}

export const createTaskService = async (
  projectId: string,
  input: CreateTaskInput,
  creatorId: string,
  requesterRole: GlobalRole = "USER",
) => {
  if (!input.title) throw new AppError(400, "Task title is required");

  const { isLeader } = await getProjectAccess(projectId, creatorId, requesterRole);
  if (!isLeader) {
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

  const task = await prisma.$transaction(async (tx) => {
    const createdTask = await createTask(
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
          taskId: createdTask.id,
          userId: input.assigneeId,
          assignedBy: creatorId,
        },
        tx,
      );
    }
    return createdTask;
  });

  const enrichedTask = await findTaskWithAssigneeById(task.id);
  const dto = toTaskListItem(enrichedTask!);
  emitTaskCreated(projectId, dto);
  return dto;
};

export const listTasksByProjectService = async (
  projectId: string,
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  const { isMember } = await getProjectAccess(projectId, requesterId, requesterRole);
  if (!isMember) {
    throw new AppError(
      403,
      "You are not authorized to view tasks in this project",
    );
  }

  const tasks = await findTasksByProjectId(projectId);

  return tasks.map(toTaskListItem);
};

export const updateTaskService = async (
  taskId: string,
  input: UpdateTaskInput,
  requesterId: string,
  projectId: string,
  requesterRole: GlobalRole = "USER",
) => {
  const { isMember, isLeader } = await getProjectAccess(projectId, requesterId, requesterRole);
  if (!isMember) {
    throw new AppError(403, "You are not authorized to update tasks in this project");
  }

  const task = await findTaskById(taskId);
  if (!task || task.projectId !== projectId) {
    throw new AppError(404, "Task not found");
  }

  const isAssignee = task.assignees.some((a) => a.userId === requesterId);

  if (!isLeader && !isAssignee) {
    throw new AppError(403, "You are not authorized to update this task");
  }

  if (
    input.progress !== undefined && 
    (!Number.isInteger(input.progress) || input.progress < 0 || input.progress > 100)
  ) {
    throw new AppError(400, "Progress must be an integer between 0 and 100");
  }

  const data: Prisma.TaskUncheckedUpdateInput = {};

  if (input.progress !== undefined) {
    data.progress = input.progress;
  }
 
  if (isLeader) {
    if (input.status !== undefined) {
      if (!Object.values(TaskStatus).includes(input.status as TaskStatus)) {
        throw new AppError(400, "Invalid task status");
      }
      data.status = input.status as TaskStatus;
      data.completedAt = input.status === "DONE" ? new Date() : null;
    }
    if (input.startDate !== undefined) {
      data.startDate = new Date(input.startDate);
    }
    if (input.dueDate !== undefined) {
      data.dueDate = new Date(input.dueDate);
    }
  }

  const updated = await updateTask(taskId, data);
  const dto = toTaskListItem(updated);
  emitTaskUpdated(projectId, dto);
  return dto;
}