import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ActiveProjectProvider } from '@/context/ActiveProjectProvider';
import { PageHeaderProvider } from '@/context/PageHeaderProvider';

/** Sidebar + sticky Topbar + scrollable content, shared by every authenticated screen. */
export function AppShell() {
  return (
    <ActiveProjectProvider>
      <PageHeaderProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
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
