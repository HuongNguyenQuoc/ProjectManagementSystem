import { useCallback, useEffect, useState } from 'react';

const ACTIVE_PROJECT_KEY = 'projecthub.activeProjectId';

/**
 * The sidebar's Board / Issues / Members entries and the Dashboard's project
 * picker all need "the project you were last looking at". Persisted so a
 * refresh does not bounce you back to project #1.
 */
export function useActiveProject() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    window.localStorage.getItem(ACTIVE_PROJECT_KEY),
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_PROJECT_KEY) setActiveProjectId(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const selectProject = useCallback((projectId: string | null) => {
    if (projectId) window.localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    else window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
    setActiveProjectId(projectId);
  }, []);

  return { activeProjectId, selectProject };
}
