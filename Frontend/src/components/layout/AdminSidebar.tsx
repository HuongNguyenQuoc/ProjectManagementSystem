import { NavLink } from 'react-router-dom';
import { ArrowLeft, Folders, ShieldCheck, SignOut, UsersThree } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `ph-nav-item${isActive ? ' is-active' : ''}`}>
      <span style={{ width: 20, display: 'grid', placeItems: 'center', fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

/** Nav for the admin area — all projects + all users, separate from the per-project Sidebar. */
export function AdminSidebar() {
  const { user, signOut } = useAuth();

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
          <ShieldCheck size={17} weight="fill" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
          Admin
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem to="/admin/projects" icon={<Folders />} label="All Projects" />
        <NavItem to="/admin/users" icon={<UsersThree />} label="Users" />
      </nav>

      <div style={{ marginTop: 16 }}>
        <NavItem to="/" icon={<ArrowLeft />} label="Back to app" />
      </div>

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
          <div style={{ fontSize: 11, color: 'var(--color-accent-300)' }}>Admin</div>
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
