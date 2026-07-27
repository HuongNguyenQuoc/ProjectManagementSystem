import { api } from '@/lib/api';
import type { AdminUserListItem, GlobalRole, UserStatus } from '@/types/api';

/** `GET /api/admin/users` — admin only. */
export function listUsers() {
  return api.get<AdminUserListItem[]>('/admin/users');
}

/** `PATCH /api/admin/users/:userId/status` — admin only, never yourself. */
export function updateUserStatus(userId: string, status: UserStatus) {
  return api.patch<AdminUserListItem>(`/admin/users/${userId}/status`, { status });
}

/** `PATCH /api/admin/users/:userId/role` — admin only, never yourself. */
export function updateUserRole(userId: string, role: GlobalRole) {
  return api.patch<AdminUserListItem>(`/admin/users/${userId}/role`, { role });
}
