import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import { qk } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import type {
  AddMemberInput,
  CreateProjectInput,
  ProjectDetail,
  ProjectRole,
  UpdateProjectInput,
} from '@/types/api';

export function useProjects() {
  return useQuery({
    queryKey: qk.projects(),
    queryFn: projectsApi.listProjects,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: qk.project(projectId ?? ''),
    queryFn: () => projectsApi.getProject(projectId as string),
    enabled: Boolean(projectId),
  });
}

/**
 * Role is per project, not per account: read it off the membership list that
 * `GET /api/projects/:id` returns. `null` means "not a member" (or not loaded).
 */
export function useProjectRole(project: ProjectDetail | undefined): ProjectRole | null {
  const { user } = useAuth();
  if (!project || !user) return null;
  return project.members.find((member) => member.userId === user.id)?.projectRole ?? null;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.createProject(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.projects() });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.updateProject(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.projects() });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMemberInput) => projectsApi.addProjectMember(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.removeProjectMember(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard(projectId) });
    },
  });
}
