import { AppError } from "../errors/appError.js";
import { findTaskById } from "../repositories/task.repository.js";
import { createComment, findCommentsByTaskId } from "../repositories/comment.repository.js";
import { findProjectMember } from "../repositories/project.repository.js";

const assertTaskInProject = async (projectId: string, taskId: string, requesterId: string) => {
  const requesterMembership = await findProjectMember(projectId, requesterId);
  if (!requesterMembership) {
    throw new AppError(403, "You are not a member of this project");
  }

  const task = await findTaskById(taskId);
  if (!task || task.projectId !== projectId) {
    throw new AppError(404, "Task not found in this project");
  }
}

export const createCommentService = async (projectId: string, taskId: string, input: { content?: string }, requesterId: string) => {
  await assertTaskInProject(projectId, taskId, requesterId);

  if (!input.content || input.content.trim() === "") {
    throw new AppError(400, "Comment content cannot be empty");
  }

  return await createComment({
    taskId, 
    userId: requesterId, 
    content: input.content.trim()
  });
};

export const listCommentsByTaskService = async (projectId: string, taskId: string, requesterId: string) => {
  await assertTaskInProject(projectId, taskId, requesterId);

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