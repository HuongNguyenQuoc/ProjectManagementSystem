import { createContext } from 'react';
import type { ProjectDetail, ProjectListItem, ProjectRole } from '@/types/api';

export interface ActiveProjectContextValue {
  projects: ProjectListItem[];
  projectsLoading: boolean;
  activeProjectId: string | null;
  /** Full detail (incl. members) for `activeProjectId`, once it resolves. */
  activeProject: ProjectDetail | undefined;
  activeProjectLoading: boolean;
  /** The signed-in user's membership role on `activeProject`, or null if not a member. */
  activeRole: ProjectRole | null;
  selectProject: (projectId: string) => void;
}

export const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);
