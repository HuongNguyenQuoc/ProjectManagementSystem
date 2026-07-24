import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '@/api/tasks';
import { qk } from '@/lib/queryClient';
import type { CreateTaskInput, TaskListItem, UpdateTaskInput } from '@/types/api';

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: qk.tasks(projectId ?? ''),
    queryFn: () => tasksApi.listTasks(projectId as string),
    enabled: Boolean(projectId),
  });
}

/** A task mutation moves project progress too, so refresh every derived view. */
function useTaskInvalidation(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: qk.tasks(projectId) });
    void queryClient.invalidateQueries({ queryKey: qk.project(projectId) });
    void queryClient.invalidateQueries({ queryKey: qk.projects() });
    void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
  };
}

export function useCreateTask(projectId: string) {
  const invalidate = useTaskInvalidation(projectId);
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.createTask(projectId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = useTaskInvalidation(projectId);
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      tasksApi.updateTask(projectId, taskId, input),
    // Drag-and-drop and the progress slider must feel instant, so patch the
    // cached list first and roll back if the server refuses.
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: qk.tasks(projectId) });
      const previous = queryClient.getQueryData<TaskListItem[]>(qk.tasks(projectId));
      queryClient.setQueryData<TaskListItem[]>(qk.tasks(projectId), (current) =>
        current?.map((task) => (task.id === taskId ? { ...task, ...input } : task)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(qk.tasks(projectId), context.previous);
    },
    onSettled: invalidate,
  });
}

/**
 * "My Tasks" spans every project, but the backend only lists tasks per project
 * and 403s the ones you are not on — so fan out and drop the refusals.
 */
export function useTasksAcrossProjects(projectIds: string[]) {
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: qk.tasks(projectId),
      queryFn: () => tasksApi.listTasks(projectId),
      retry: false,
    })),
    combine: (results) => ({
      isLoading: results.some((result) => result.isLoading),
      byProject: results.map((result, index) => ({
        projectId: projectIds[index],
        tasks: result.data ?? [],
        // A 403 here just means "not your project" — not an error worth showing.
        denied: result.isError,
      })),
    }),
  });
}
