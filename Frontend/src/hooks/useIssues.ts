import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as issuesApi from '@/api/issues';
import { qk } from '@/lib/queryClient';
import type { CreateIssueInput, UpdateIssueInput } from '@/types/api';

export function useIssues(projectId: string | undefined) {
  return useQuery({
    queryKey: qk.issues(projectId ?? ''),
    queryFn: () => issuesApi.listIssues(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIssueInput) => issuesApi.createIssue(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.issues(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}

export function useUpdateIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, input }: { issueId: string; input: UpdateIssueInput }) =>
      issuesApi.updateIssue(projectId, issueId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.issues(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}
