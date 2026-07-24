import { useMemo, useState } from 'react';
import { CaretRight, ListChecks } from '@phosphor-icons/react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { TaskDrawer } from '@/components/task/TaskDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, useProject, useProjectRole } from '@/hooks/useProjects';
import { useTasksAcrossProjects } from '@/hooks/useTasks';
import { usePageHeader } from '@/hooks/usePageHeader';
import { TASK_PRIORITY } from '@/lib/constants';
import { formatDate, taskCode } from '@/lib/format';
import type { TaskListItem } from '@/types/api';

interface MyTask extends TaskListItem {
  projectId: string;
  projectName: string;
}

export function MyTasksPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const projectIds = useMemo(() => (projects ?? []).map((project) => project.id), [projects]);
  const { isLoading: tasksLoading, byProject } = useTasksAcrossProjects(projectIds);
  const [openTask, setOpenTask] = useState<{ projectId: string; taskId: string } | null>(null);

  usePageHeader({ title: 'My Tasks', subtitle: 'Everything assigned to you' });

  const myTasks: MyTask[] = useMemo(() => {
    if (!user || !projects) return [];
    const nameById = new Map(projects.map((project) => [project.id, project.name]));
    return byProject
      .filter((entry) => !entry.denied)
      .flatMap((entry) =>
        entry.tasks
          .filter((task) => task.assigneeId === user.id)
          .map((task) => ({ ...task, projectId: entry.projectId, projectName: nameById.get(entry.projectId) ?? '' })),
      );
  }, [byProject, projects, user]);

  const stats = [
    { label: 'Assigned', value: myTasks.length },
    { label: 'In progress', value: myTasks.filter((task) => task.status === 'IN_PROGRESS').length },
    { label: 'Done', value: myTasks.filter((task) => task.status === 'DONE').length },
  ];

  const openTaskDetail = myTasks.find(
    (task) => task.projectId === openTask?.projectId && task.id === openTask?.taskId,
  );
  const { data: openProject } = useProject(openTask?.projectId);
  const openRole = useProjectRole(openProject);

  if (projectsLoading || tasksLoading) return <LoadingState label="Loading your tasks…" />;

  return (
    <div className="ph-screen" style={{ maxWidth: 900 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card elev-sm" style={{ gap: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 13,
          color: 'var(--color-neutral-300)',
          fontFamily: 'var(--font-heading)',
          marginBottom: 12,
        }}
      >
        Assigned to you
      </div>

      {!myTasks.length ? (
        <EmptyState
          icon={<ListChecks size={28} />}
          title="Nothing assigned yet"
          description="Tasks a project leader assigns to you will show up here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {myTasks.map((task) => {
            const priority = TASK_PRIORITY[task.priority];
            return (
              <div
                key={task.id}
                className="card ph-card-lift elev-sm"
                onClick={() => setOpenTask({ projectId: task.projectId, taskId: task.id })}
                role="button"
                tabIndex={0}
                style={{
                  cursor: 'pointer',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderLeft: `3px solid ${priority.color}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span className="ph-truncate" style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                      {task.title}
                    </span>
                    <Tag style={priority.tag}>{priority.label}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>
                    {task.projectName} · {taskCode(task.id)} · Due {formatDate(task.dueDate)}
                  </div>
                </div>
                <div style={{ width: 130, flex: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      marginBottom: 4,
                      color: 'var(--color-neutral-400)',
                    }}
                  >
                    <span>{task.status.replace('_', ' ')}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <ProgressBar value={task.progress} />
                </div>
                <CaretRight size={16} color="var(--color-neutral-500)" />
              </div>
            );
          })}
        </div>
      )}

      {openTaskDetail ? (
        <TaskDrawer
          task={openTaskDetail}
          projectId={openTaskDetail.projectId}
          projectName={openTaskDetail.projectName}
          isLeader={openRole === 'PROJECT_LEADER'}
          isAssignee
          onClose={() => setOpenTask(null)}
        />
      ) : null}
    </div>
  );
}
