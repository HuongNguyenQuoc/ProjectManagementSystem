import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '@/api/comments';
import { qk } from '@/lib/queryClient';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import type { CommentDto } from '@/types/api';


export function useComments(projectId: string | undefined, taskId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qk.comments(projectId ?? '', taskId ?? ''),
    queryFn: () => commentsApi.listComments(projectId as string, taskId as string),
    enabled: Boolean(projectId && taskId),
  });

  useEffect(() => {
    if (!projectId || !taskId) return;
    const socket = getSocket();
    socket.emit('join-task', { projectId, taskId });

    function onNewComment(comment: CommentDto) {
      queryClient.setQueryData<CommentDto[]>(
        qk.comments(projectId as string, taskId as string),
        (prev) => (prev?.some((c) => c.id === comment.id) ? prev : [...(prev ?? []), comment]),
      );
    }
    socket.on('comment:new', onNewComment);
    
    return () => {
      socket.off('comment:new', onNewComment);
      socket.emit('leave-task', { taskId });
    };
  }, [projectId, taskId, queryClient]);
  return query;
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
