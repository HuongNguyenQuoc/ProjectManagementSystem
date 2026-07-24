import { api } from '@/lib/api';
import type { CreateIssueInput, IssueListItem, UpdateIssueInput } from '@/types/api';

/** `GET /api/projects/:projectId/issues` — any member of the project. */
export function listIssues(projectId: string) {
  return api.get<IssueListItem[]>(`/projects/${projectId}/issues`);
}

/** `POST /api/projects/:projectId/issues` — any member may report. */
export function createIssue(projectId: string, input: CreateIssueInput) {
  return api.post<IssueListItem>(`/projects/${projectId}/issues`, input);
}

/** `PATCH /api/projects/:projectId/issues/:issueId` — leader only. */
export function updateIssue(projectId: string, issueId: string, input: UpdateIssueInput) {
  return api.patch<IssueListItem>(`/projects/${projectId}/issues/${issueId}`, input);
}
