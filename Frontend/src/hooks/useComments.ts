import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '@/api/comments';
import { qk } from '@/lib/queryClient';

export function useComments(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: qk.comments(projectId ?? '', taskId ?? ''),
    queryFn: () => commentsApi.listComments(projectId as string, taskId as string),
    enabled: Boolean(projectId && taskId),
  });
}

export function useCreateComment(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.createComment(projectId, taskId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.comments(projectId, taskId) });
    },
  });
}
