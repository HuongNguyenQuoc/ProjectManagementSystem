import { AppError } from "../errors/appError.js";
import type { GlobalRole } from "../generated/prisma/enums.js";
import { findTaskById } from "../repositories/task.repository.js";
import { createComment, findCommentsByTaskId } from "../repositories/comment.repository.js";
import { getProjectAccess } from "./projectAccess.js";

const assertTaskInProject = async (
  projectId: string,
  taskId: string,
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  const { isMember } = await getProjectAccess(projectId, requesterId, requesterRole);
  if (!isMember) {
    throw new AppError(403, "You are not a member of this project");
  }

  const task = await findTaskById(taskId);
  if (!task || task.projectId !== projectId) {
    throw new AppError(404, "Task not found in this project");
  }
}

export const createCommentService = async (
  projectId: string,
  taskId: string,
  input: { content?: string },
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  await assertTaskInProject(projectId, taskId, requesterId, requesterRole);

  if (!input.content || input.content.trim() === "") {
    throw new AppError(400, "Comment content cannot be empty");
  }

  return await createComment({
    taskId,
    userId: requesterId,
    content: input.content.trim()
  });
};

export const listCommentsByTaskService = async (
  projectId: string,
  taskId: string,
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  await assertTaskInProject(projectId, taskId, requesterId, requesterRole);

  const comments = await findCommentsByTaskId(taskId);

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    authorName: comment.user.fullName,
    authorId: comment.userId,
    isEdited: comment.isEdited,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};