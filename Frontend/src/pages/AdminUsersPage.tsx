import { useMemo, useState } from 'react';
import { UsersThree } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { TableCard } from '@/components/ui/TableCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus } from '@/hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { GLOBAL_ROLE_LABEL, USER_STATUS } from '@/lib/constants';
import { USER_STATUSES, type UserStatus } from '@/types/api';

/** Admin view of every user account: status + global role controls. */
export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { data: users, isLoading, isError, refetch } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState('');

  usePageHeader({
    title: 'Users',
    subtitle: 'Every account in the system',
    search: { value: search, onChange: setSearch, placeholder: 'Search users…' },
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users ?? [];
    return (users ?? []).filter(
      (user) => user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  async function handleStatusChange(userId: string, status: UserStatus) {
    try {
      await updateStatus.mutateAsync({ userId, status });
      showToast('Status updated');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    }
  }

  // Demote-only: there is no control here to grant ADMIN — a new admin can
  // only be created via the seed script, so this UI can't mint more of them.
  async function handleDemoteToUser(userId: string) {
    try {
      await updateRole.mutateAsync({ userId, role: 'USER' });
      showToast('Demoted to User');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    }
  }

  if (isLoading) return <LoadingState label="Loading users…" />;
  if (isError) return <ErrorState error={new Error('Could not load users')} onRetry={() => void refetch()} />;

  return (
    <div className="ph-screen">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{filtered.length} users</span>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={<UsersThree size={28} />}
          title="No users found"
          description={search ? 'Try a different search.' : 'No accounts have registered yet.'}
        />
      ) : (
        <TableCard>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Projects</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const status = USER_STATUS[user.status];
                const role = GLOBAL_ROLE_LABEL[user.role];
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={user.fullName} colorKey={user.id} size={30} />
                        <div style={{ minWidth: 0 }}>
                          <div className="ph-truncate" style={{ fontFamily: 'var(--font-heading)', maxWidth: 220 }}>
                            {user.fullName}
                          </div>
                          <div
                            className="ph-truncate"
                            style={{ fontSize: 11.5, color: 'var(--color-neutral-400)', maxWidth: 220 }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{user.projectCount}</td>
                    <td>
                      {isSelf ? (
                        <Tag style={status.tag}>{status.label}</Tag>
                      ) : (
                        <select
                          className="input"
                          style={{ height: 30, fontSize: 12.5, padding: '0 8px' }}
                          value={user.status}
                          disabled={updateStatus.isPending}
                          onChange={(event) => void handleStatusChange(user.id, event.target.value as UserStatus)}
                        >
                          {USER_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {USER_STATUS[value].label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      {!isSelf && user.role === 'ADMIN' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag style={role.tag}>{role.label}</Tag>
                          <Button
                            variant="ghost"
                            loading={updateRole.isPending}
                            onClick={() => void handleDemoteToUser(user.id)}
                            style={{ height: 26, fontSize: 11.5, padding: '0 8px' }}
                          >
                            Demote to User
                          </Button>
                        </div>
                      ) : (
                        <Tag style={role.tag}>{role.label}</Tag>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
      )}
    </div>
  );
}
