import { Navigate } from 'react-router-dom';
import { LoadingState } from '@/components/ui/States';
import { useActiveProjectContext } from '@/hooks/useActiveProjectContext';

/** Send leaders to the dashboard and members to My Tasks, based on the active project's role. */
export function IndexRedirect() {
  const { projectsLoading, activeProjectLoading, activeProjectId, activeRole } = useActiveProjectContext();

  if (projectsLoading || (activeProjectId && activeProjectLoading)) {
    return <LoadingState />;
  }

  return <Navigate to={activeRole === 'PROJECT_LEADER' ? '/dashboard' : '/my-tasks'} replace />;
}
