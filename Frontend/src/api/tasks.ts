import { api } from '@/lib/api';
import type { CreateTaskInput, TaskListItem, TaskRow, UpdateTaskInput } from '@/types/api';

/** `GET /api/projects/:projectId/tasks` — any member of the project. */
export function listTasks(projectId: string) {
  return api.get<TaskListItem[]>(`/projects/${projectId}/tasks`);
}

/** `POST /api/projects/:projectId/tasks` — leader only. */
export function createTask(projectId: string, input: CreateTaskInput) {
  return api.post<TaskRow>(`/projects/${projectId}/tasks`, input);
}

/**
 * `PATCH /api/projects/:projectId/tasks/:taskId`.
 * Leader: status + dates + progress. Member: progress on their own tasks only.
 */
export function updateTask(projectId: string, taskId: string, input: UpdateTaskInput) {
  return api.patch<TaskRow>(`/projects/${projectId}/tasks/${taskId}`, input);
}
