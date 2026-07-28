import { AppError } from "../errors/appError.js";
import type { GlobalRole } from "../generated/prisma/enums.js";
import { findTaskById } from "../repositories/task.repository.js";
import { createComment, findCommentsByTaskId } from "../repositories/comment.repository.js";
import { getProjectAccess } from "./projectAccess.js";
import { emitNewComment } from "../lib/socket.js";

export interface CommentDto {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const toCommentDto = (comment: {
  id: string;
  content: string;
  userId: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { fullName: string };
}): CommentDto => ({
  id: comment.id,
  content: comment.content,
  authorName: comment.user.fullName,
  authorId: comment.userId,
  isEdited: comment.isEdited,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

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

  const comment = await createComment({
    taskId,
    userId: requesterId,
    content: input.content.trim()
  });

  const dto = toCommentDto(comment);
  emitNewComment(taskId, dto);
  return dto;
};

export const listCommentsByTaskService = async (
  projectId: string,
  taskId: string,
  requesterId: string,
  requesterRole: GlobalRole = "USER",
) => {
  await assertTaskInProject(projectId, taskId, requesterId, requesterRole);

  const comments = await findCommentsByTaskId(taskId);

  return comments.map(toCommentDto);
};