import { CrownSimple } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { MEMBER_POSITION } from '@/lib/constants';
import type { ProjectMemberDto, TaskListItem } from '@/types/api';

interface MembersGridProps {
  members: ProjectMemberDto[];
  tasks: TaskListItem[];
  canManage: boolean;
  onRemove?: (userId: string) => void;
  removingUserId?: string | null;
}

/** Members tab — avatar, name (+ crown for the leader), position, email, task count. */
export function MembersGrid({ members, tasks, canManage, onRemove, removingUserId }: MembersGridProps) {
  if (!members.length) {
    return <EmptyState title="No members yet" description="Add teammates to start assigning work." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {members.map((member) => {
        const taskCount = tasks.filter((task) => task.assigneeId === member.userId).length;
        const isLeader = member.projectRole === 'PROJECT_LEADER';
        return (
          <div
            key={member.userId}
            className="card ph-card-lift elev-sm"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Avatar name={member.fullName} colorKey={member.userId} size={44} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  className="ph-truncate"
                  style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}
                >
                  {member.fullName}
                </span>
                {isLeader ? (
                  <span title="Leader" style={{ display: 'inline-flex' }}>
                    <CrownSimple weight="fill" color="var(--color-accent)" size={13} />
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>
                {MEMBER_POSITION[member.position]}
              </div>
              <div
                className="ph-truncate"
                style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}
              >
                {member.email}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <Tag style={{ background: 'var(--color-neutral-800)', color: 'var(--color-neutral-200)' }}>
                {taskCount} tasks
              </Tag>
              {canManage && !isLeader ? (
                <Button
                  variant="ghost"
                  onClick={() => onRemove?.(member.userId)}
                  loading={removingUserId === member.userId}
                  style={{ height: 24, padding: '0 8px', fontSize: 11.5 }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
