import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthProvider } from '@/context/AuthProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { queryClient } from '@/lib/queryClient';
import { DashboardPage } from '@/pages/DashboardPage';
import { IndexRedirect } from '@/pages/IndexRedirect';
import { LoginPage } from '@/pages/LoginPage';
import { MyTasksPage } from '@/pages/MyTasksPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectsPage } from '@/pages/ProjectsPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<IndexRedirect />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="my-tasks" element={<MyTasksPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
