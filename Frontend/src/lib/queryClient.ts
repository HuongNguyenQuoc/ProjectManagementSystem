import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // 401/403/404 are answers, not flakiness — never retry them.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

/** Central key factory so invalidation never drifts from the fetchers. */
export const qk = {
  projects: () => ['projects'] as const,
  project: (projectId: string) => ['project', projectId] as const,
  tasks: (projectId: string) => ['tasks', projectId] as const,
  issues: (projectId: string) => ['issues', projectId] as const,
  comments: (projectId: string, taskId: string) => ['comments', projectId, taskId] as const,
  dashboard: (projectId: string) => ['dashboard', projectId] as const,
};
