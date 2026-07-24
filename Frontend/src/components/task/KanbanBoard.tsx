import { useState, type DragEvent } from 'react';
import { TaskCard } from '@/components/task/TaskCard';
import { BOARD_COLUMNS, TASK_STATUS } from '@/lib/constants';
import type { TaskListItem, TaskStatus } from '@/types/api';

interface KanbanBoardProps {
  tasks: TaskListItem[];
  onOpenTask: (taskId: string) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  /** Only the leader may change a task's status — see `updateTaskService`. */
  canDragStatus: boolean;
}

function Column({
  status,
  tasks,
  onOpenTask,
  canDragStatus,
  draggingId,
  setDraggingId,
  onMoveTask,
}: {
  status: TaskStatus;
  tasks: TaskListItem[];
  onOpenTask: (taskId: string) => void;
  canDragStatus: boolean;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const meta = TASK_STATUS[status];

  return (
    <div
      className={`ph-col${isOver ? ' is-over' : ''}`}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (!canDragStatus) return;
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsOver(false);
        if (!canDragStatus || !draggingId) return;
        onMoveTask(draggingId, status);
        setDraggingId(null);
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px 10px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: meta.color }} />
        <span
          style={{
            fontSize: 12,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--color-neutral-500)',
            background: 'var(--color-neutral-900)',
            padding: '1px 8px',
            borderRadius: 20,
          }}
        >
          {tasks.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpenTask}
            draggable={canDragStatus}
            onDragStart={(event, taskId) => {
              setDraggingId(taskId);
              event.dataTransfer.effectAllowed = 'move';
              event.currentTarget.classList.add('is-dragging');
            }}
            onDragEnd={(event) => {
              event.currentTarget.classList.remove('is-dragging');
              setDraggingId(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onOpenTask, onMoveTask, canDragStatus }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(210px, 1fr))',
        gap: 12,
        alignItems: 'start',
      }}
    >
      {BOARD_COLUMNS.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onOpenTask={onOpenTask}
          canDragStatus={canDragStatus}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          onMoveTask={onMoveTask}
        />
      ))}
    </div>
  );
}
