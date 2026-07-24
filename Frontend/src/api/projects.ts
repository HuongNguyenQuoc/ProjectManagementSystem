import { api } from '@/lib/api';
import type {
  AddMemberInput,
  CreateProjectInput,
  ProjectDetail,
  ProjectListItem,
  ProjectMemberRow,
  UpdateProjectInput,
} from '@/types/api';

/** `GET /api/projects` — returns every project, membership not required. */
export function listProjects() {
  return api.get<ProjectListItem[]>('/projects');
}

/** `GET /api/projects/:projectId` — 403 unless you are a member. */
export function getProject(projectId: string) {
  return api.get<ProjectDetail>(`/projects/${projectId}`);
}

/** `POST /api/projects` — the creator becomes PROJECT_LEADER. */
export function createProject(input: CreateProjectInput) {
  return api.post<ProjectDetail>('/projects', input);
}

/** `PATCH /api/projects/:projectId` — leader only. */
export function updateProject(projectId: string, input: UpdateProjectInput) {
  return api.patch<ProjectDetail>(`/projects/${projectId}`, input);
}

/** `POST /api/projects/:projectId/members` — leader only. */
export function addProjectMember(projectId: string, input: AddMemberInput) {
  return api.post<ProjectMemberRow>(`/projects/${projectId}/members`, input);
}

/** `DELETE /api/projects/:projectId/members/:userId` — leader only, never the leader. */
export function removeProjectMember(projectId: string, userId: string) {
  return api.delete<ProjectMemberRow>(`/projects/${projectId}/members/${userId}`);
}
