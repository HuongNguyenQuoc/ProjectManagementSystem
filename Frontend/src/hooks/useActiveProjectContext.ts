import { useContext } from 'react';
import { ActiveProjectContext } from '@/context/active-project-context';

export function useActiveProjectContext() {
  const context = useContext(ActiveProjectContext);
  if (!context) throw new Error('useActiveProjectContext must be used inside <ActiveProjectProvider>');
  return context;
}
