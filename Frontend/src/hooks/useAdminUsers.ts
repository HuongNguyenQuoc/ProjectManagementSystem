import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/api/admin';
import { qk } from '@/lib/queryClient';
import type { GlobalRole, UserStatus } from '@/types/api';

export function useAdminUsers() {
  return useQuery({
    queryKey: qk.adminUsers(),
    queryFn: adminApi.listUsers,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.adminUsers() });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GlobalRole }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.adminUsers() });
    },
  });
}
