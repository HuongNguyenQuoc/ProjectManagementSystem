import type { DragEvent } from 'react';
import { CalendarBlank } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { formatDate, taskCode } from '@/lib/format';
import { TASK_PRIORITY } from '@/lib/constants';
import type { TaskListItem } from '@/types/api';

interface TaskCardProps {
  task: TaskListItem;
  onOpen: (taskId: string) => void;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
}

/** Kanban card — priority-coloured left border, mini progress bar, due + assignee. */
export function TaskCard({ task, onOpen, draggable = false, onDragStart, onDragEnd }: TaskCardProps) {
  const priority = TASK_PRIORITY[task.priority];

  return (
    <div
      className="ph-task elev-sm"
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen(task.id);
      }}
      style={{
        background: 'var(--color-bg)',
        borderRadius: 9,
        padding: 11,
        cursor: 'pointer',
        borderLeft: `3px solid ${priority.color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>{taskCode(task.id)}</span>
        <Tag style={priority.tag}>{priority.label}</Tag>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.35, marginBottom: 9 }}>{task.title}</div>
      <div style={{ marginBottom: 9 }}>
        <ProgressBar
          value={task.progress}
          height={5}
          fill={task.status === 'DONE' ? 'var(--color-success)' : undefined}
          durationMs={400}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: 'var(--color-neutral-400)',
          }}
        >
          <CalendarBlank size={12} />
          {formatDate(task.dueDate)}
        </span>
        <Avatar name={task.assigneeName} colorKey={task.assigneeId} size={22} />
      </div>
    </div>
  );
}
