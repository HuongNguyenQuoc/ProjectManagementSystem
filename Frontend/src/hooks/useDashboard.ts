import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/dashboard';
import { qk } from '@/lib/queryClient';

/**
 * Leader-only endpoint. Pass `enabled: false` for members rather than letting
 * the request 403 — the sidebar already hides the screen from them.
 */
export function useDashboard(projectId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.dashboard(projectId ?? ''),
    queryFn: () => getDashboard(projectId as string),
    enabled: Boolean(projectId) && enabled,
  });
}
