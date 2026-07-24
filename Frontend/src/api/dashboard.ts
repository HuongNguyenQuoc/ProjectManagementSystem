import { api } from '@/lib/api';
import type { DashboardDto } from '@/types/api';

/** `GET /api/projects/:projectId/dashboard` — 403 for anyone but the leader. */
export function getDashboard(projectId: string) {
  return api.get<DashboardDto>(`/projects/${projectId}/dashboard`);
}
