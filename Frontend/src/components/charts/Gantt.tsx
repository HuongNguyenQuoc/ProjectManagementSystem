import { TASK_STATUS } from '@/lib/constants';
import type { TaskListItem } from '@/types/api';
import { EmptyState } from '@/components/ui/States';

const LABEL_WIDTH = 150;

/** Project schedule as a mini Gantt — bars positioned by start/due span. */
export function Gantt({ tasks }: { tasks: TaskListItem[] }) {
  const scheduled = tasks.filter((task) => task.startDate && task.dueDate);

  if (!scheduled.length) {
    return <EmptyState title="No scheduled tasks" description="Add start and due dates to see the timeline." />;
  }

  const dates = scheduled.flatMap((task) => [
    new Date(task.startDate as string).getTime(),
    new Date(task.dueDate as string).getTime(),
  ]);
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  const span = max - min || 1;

  const months: Date[] = [];
  const cursor = new Date(min);
  cursor.setDate(1);
  while (cursor.getTime() <= max) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          position: 'relative',
          marginLeft: LABEL_WIDTH,
          height: 16,
          marginBottom: 4,
          borderBottom: '1px solid var(--color-divider)',
          paddingBottom: 4,
        }}
      >
        {months.map((month) => {
          const left = ((month.getTime() - min) / span) * 100;
          return (
            <span
              key={month.toISOString()}
              style={{
                position: 'absolute',
                left: `${left}%`,
                fontSize: 10,
                color: 'var(--color-neutral-500)',
                whiteSpace: 'nowrap',
              }}
            >
              {month.toLocaleDateString('en-US', { month: 'short' })}
            </span>
          );
        })}
      </div>

      {scheduled.map((task) => {
        const status = TASK_STATUS[task.status];
        const start = new Date(task.startDate as string).getTime();
        const due = new Date(task.dueDate as string).getTime();
        const left = ((start - min) / span) * 100;
        const width = ((due - start) / span) * 100;

        return (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 24 }}>
            <span
              className="ph-truncate"
              title={task.title}
              style={{ width: LABEL_WIDTH, flex: 'none', fontSize: 12, color: 'var(--color-neutral-300)' }}
            >
              {task.title}
            </span>
            <div style={{ position: 'relative', flex: 1, height: 16 }}>
              <div
                title={`${status.label} · ${task.progress}%`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${Math.max(width, 3)}%`,
                  height: 16,
                  background: 'var(--color-neutral-800)',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    background: status.color,
                    borderRadius: 5,
                    transition: 'width .7s ease',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
