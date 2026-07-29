import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as issuesApi from '@/api/issues';
import { qk } from '@/lib/queryClient';
import type { CreateIssueInput, UpdateIssueInput, IssueListItem } from '@/types/api';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';


export function useIssues(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qk.issues(projectId ?? ''),
    queryFn: () => issuesApi.listIssues(projectId as string),
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.emit('join-project', { projectId });

    function upsert(issue: IssueListItem) {
      queryClient.setQueryData<IssueListItem[]>(qk.issues(projectId as string), (prev) => {
        if (!prev) return [issue];
        const exists = prev.some((i) => i.id === issue.id);
        return exists ? prev.map((i) => (i.id === issue.id ? issue : i)) : [...prev, issue];
      });
    }

    function remove({ id }: { id: string }) {
      queryClient.setQueryData<IssueListItem[]>(qk.issues(projectId as string), (prev) => prev?.filter((i) => i.id !== id),
      );
    }

    socket.on('issue:created', upsert);
    socket.on('issue:updated', upsert);
    socket.on('issue:deleted', remove);

    return () => {
      socket.off('issue:created', upsert);
      socket.off('issue:updated', upsert);
      socket.off('issue:deleted', remove);
      socket.emit('leave-project', { projectId });
    };
  }, [projectId, queryClient]);

  return query;
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

export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => issuesApi.deleteIssue(projectId, issueId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.issues(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}
