import { NavLink } from 'react-router-dom';
import {
  ChartPieSlice,
  Folders,
  Kanban,
  ListChecks,
  SignOut,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useActiveProjectContext } from '@/hooks/useActiveProjectContext';
import { PROJECT_ROLE_LABEL } from '@/lib/constants';

function NavItem({
  to,
  icon,
  label,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <NavLink to={to} className={({ isActive }) => `ph-nav-item${isActive ? ' is-active' : ''}`}>
      <span style={{ width: 20, display: 'grid', placeItems: 'center', fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
      {badge ? (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            background: 'var(--color-neutral-800)',
            color: 'var(--color-neutral-200)',
            padding: '1px 7px',
            borderRadius: 20,
          }}
        >
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

/**
 * Leader/Member nav differs by the active project's role (see
 * ActiveProjectProvider) — there is no global role in this backend, only
 * per-project membership.
 */
export function Sidebar() {
  const { user, signOut } = useAuth();
  const { projects, activeProjectId, activeRole } = useActiveProjectContext();
  const isLeader = activeRole === 'PROJECT_LEADER';
  const projectPath = activeProjectId ? `/projects/${activeProjectId}` : '/projects';

  return (
    <aside
      style={{
        width: 236,
        flex: 'none',
        borderRight: '1px solid var(--color-divider)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 20px' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'var(--color-accent)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--color-bg)',
          }}
        >
          <Kanban size={17} weight="fill" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
          ProjectHub
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isLeader ? (
          <>
            <NavItem to="/dashboard" icon={<ChartPieSlice />} label="Dashboard" />
            <NavItem to="/projects" icon={<Folders />} label="Projects" badge={String(projects.length)} />
            <NavItem to={projectPath} icon={<Kanban />} label="Board" />
            <NavItem to={`${projectPath}?tab=issues`} icon={<WarningCircle />} label="Issues" />
            <NavItem to={`${projectPath}?tab=members`} icon={<UsersThree />} label="Members" />
          </>
        ) : (
          <>
            <NavItem to="/my-tasks" icon={<ListChecks />} label="My Tasks" />
            <NavItem to="/projects" icon={<Folders />} label="Projects" badge={String(projects.length)} />
          </>
        )}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--color-divider)',
          paddingTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Avatar name={user?.fullName} colorKey={user?.id} size={34} />
        <div style={{ minWidth: 0 }}>
          <div className="ph-truncate" style={{ fontSize: 13, fontFamily: 'var(--font-heading)' }}>
            {user?.fullName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-accent-300)' }}>
            {activeRole ? PROJECT_ROLE_LABEL[activeRole] : '—'}
          </div>
        </div>
        <Button
          variant="icon"
          onClick={() => void signOut()}
          title="Sign out"
          style={{ marginLeft: 'auto' }}
        >
          <SignOut size={16} />
        </Button>
      </div>
    </aside>
  );
}
