import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { GlobalRole } from '@/types/api';

/** Nested inside `ProtectedRoute`, so a session is already guaranteed here. */
export function RequireRole({ role }: { role: GlobalRole }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
