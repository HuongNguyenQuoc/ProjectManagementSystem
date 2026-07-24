import { useEffect, useMemo, type ReactNode } from 'react';
import { ActiveProjectContext, type ActiveProjectContextValue } from '@/context/active-project-context';
import { useActiveProject } from '@/hooks/useActiveProject';
import { useProject, useProjectRole, useProjects } from '@/hooks/useProjects';

/**
 * `GET /api/projects` lists every project in the system (no membership
 * filter in the backend), so "which project am I looking at" and "what is
 * my role there" have to be resolved client-side. This provider picks a
 * sensible default (the persisted project, else the first in the list) and
 * exposes the resolved role so the Sidebar/Topbar can render the right nav.
 */
export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { activeProjectId, selectProject } = useActiveProject();

  useEffect(() => {
    if (!activeProjectId && projects && projects.length > 0) {
      selectProject(projects[0].id);
    }
  }, [activeProjectId, projects, selectProject]);

  const resolvedProjectId =
    activeProjectId && projects?.some((project) => project.id === activeProjectId)
      ? activeProjectId
      : (projects?.[0]?.id ?? null);

  const { data: activeProject, isLoading: activeProjectLoading } = useProject(
    resolvedProjectId ?? undefined,
  );
  const activeRole = useProjectRole(activeProject);

  const value = useMemo<ActiveProjectContextValue>(
    () => ({
      projects: projects ?? [],
      projectsLoading,
      activeProjectId: resolvedProjectId,
      activeProject,
      activeProjectLoading,
      activeRole,
      selectProject,
    }),
    [projects, projectsLoading, resolvedProjectId, activeProject, activeProjectLoading, activeRole, selectProject],
  );

  return (
    <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>
  );
}
