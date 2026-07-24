import { api } from '@/lib/api';
import type { CommentDto } from '@/types/api';

/** `GET /api/projects/:projectId/tasks/:taskId/comments` — oldest first. */
export function listComments(projectId: string, taskId: string) {
  return api.get<CommentDto[]>(`/projects/${projectId}/tasks/${taskId}/comments`);
}

/** `POST /api/projects/:projectId/tasks/:taskId/comments` — any member. */
export function createComment(projectId: string, taskId: string, content: string) {
  return api.post<CommentDto>(`/projects/${projectId}/tasks/${taskId}/comments`, { content });
}
