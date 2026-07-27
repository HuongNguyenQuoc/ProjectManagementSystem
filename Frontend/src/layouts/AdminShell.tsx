import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ActiveProjectProvider } from '@/context/ActiveProjectProvider';
import { PageHeaderProvider } from '@/context/PageHeaderProvider';

/**
 * Admin sidebar + Topbar + scrollable content. Still wraps `ActiveProjectProvider`
 * because the admin area reuses `ProjectDetailPage`, which depends on it.
 */
export function AdminShell() {
  return (
    <ActiveProjectProvider>
      <PageHeaderProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar />
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 30px 60px' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </PageHeaderProvider>
    </ActiveProjectProvider>
  );
}
