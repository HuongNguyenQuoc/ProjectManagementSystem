import { Avatar } from '@/components/ui/Avatar';
import { StatusDot, Tag } from '@/components/ui/Tag';
import { TableCard } from '@/components/ui/TableCard';
import { EmptyState } from '@/components/ui/States';
import { formatDate, taskCode } from '@/lib/format';
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/constants';
import type { TaskListItem } from '@/types/api';

/** Board "List" view — Task / Assignee / Priority / Status / Due. */
export function TaskTable({
  tasks,
  onOpenTask,
}: {
  tasks: TaskListItem[];
  onOpenTask: (taskId: string) => void;
}) {
  if (!tasks.length) {
    return <EmptyState title="No tasks yet" description="Tasks created for this project will show up here." />;
  }

  return (
    <TableCard>
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Assignee</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const priority = TASK_PRIORITY[task.priority];
            const status = TASK_STATUS[task.status];
            return (
              <tr
                key={task.id}
                className="ph-row-btn"
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenTask(task.id)}
              >
                <td>
                  <div style={{ fontFamily: 'var(--font-heading)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{taskCode(task.id)}</div>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Avatar name={task.assigneeName} colorKey={task.assigneeId} size={22} />
                    {task.assigneeName ?? 'Unassigned'}
                  </span>
                </td>
                <td>
                  <Tag style={priority.tag}>{priority.label}</Tag>
                </td>
                <td>
                  <StatusDot color={status.color} label={status.label} />
                </td>
                <td style={{ color: 'var(--color-neutral-400)' }}>{formatDate(task.dueDate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableCard>
  );
}
