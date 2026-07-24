import { ChartPieSlice } from '@phosphor-icons/react';
import { ClockCountdown, ListChecks, SpinnerGap, WarningCircle } from '@phosphor-icons/react';
import { Gantt } from '@/components/charts/Gantt';
import { HorizontalBars, VerticalBars } from '@/components/charts/Bars';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Tag } from '@/components/ui/Tag';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useActiveProjectContext } from '@/hooks/useActiveProjectContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useTasks } from '@/hooks/useTasks';
import { usePageHeader } from '@/hooks/usePageHeader';
import { BOARD_COLUMNS, ISSUE_SEVERITY, PROJECT_STATUS, TASK_PRIORITY, TASK_STATUS } from '@/lib/constants';
import { ISSUE_SEVERITIES, TASK_PRIORITIES } from '@/types/api';

export function DashboardPage() {
  const { projects, activeProjectId, activeRole, selectProject } = useActiveProjectContext();
  const isLeader = activeRole === 'PROJECT_LEADER';

  usePageHeader({ title: 'Dashboard', subtitle: 'Project statistics & health' });

  const { data: dashboard, isLoading: dashboardLoading, isError, refetch } = useDashboard(
    activeProjectId ?? undefined,
    isLeader,
  );
  const { data: tasks } = useTasks(isLeader ? (activeProjectId ?? undefined) : undefined);

  if (!projects.length) {
    return <EmptyState icon={<ChartPieSlice size={28} />} title="No projects yet" description="Create a project to see its dashboard." />;
  }

  if (!isLeader) {
    return (
      <EmptyState
        icon={<ChartPieSlice size={28} />}
        title="Leader-only view"
        description="Only the project leader can view the dashboard for this project."
      />
    );
  }

  if (dashboardLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError || !dashboard) return <ErrorState error={new Error('Dashboard unavailable')} onRetry={() => void refetch()} />;

  const statusEntries = BOARD_COLUMNS.map((key) => ({
    label: TASK_STATUS[key].label,
    value: dashboard.tasksByStatus[key] ?? 0,
    color: TASK_STATUS[key].color,
  }));
  const priorityEntries = TASK_PRIORITIES.map((key) => ({
    label: TASK_PRIORITY[key].label,
    value: dashboard.tasksByPriority[key] ?? 0,
    color: TASK_PRIORITY[key].color,
  }));
  const severityEntries = ISSUE_SEVERITIES.map((key) => ({
    label: ISSUE_SEVERITY[key].label,
    value: dashboard.issuesBySeverity[key] ?? 0,
    color: ISSUE_SEVERITY[key].color,
  }));

  const statusMeta = PROJECT_STATUS[dashboard.status];

  return (
    <div className="ph-screen" style={{ maxWidth: 1180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <select
          className="input"
          value={activeProjectId ?? ''}
          onChange={(event) => selectProject(event.target.value)}
          style={{ width: 'auto', minWidth: 240, fontFamily: 'var(--font-heading)', fontSize: 15 }}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <Tag style={statusMeta.tag}>{statusMeta.label}</Tag>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard
          label="Total tasks"
          value={dashboard.totalTasks}
          sub={`${dashboard.completedTasks} completed`}
          subColor="var(--color-neutral-400)"
          icon={<ListChecks size={16} />}
          iconStyle={{ background: 'var(--color-accent-900)', color: 'var(--color-accent-300)' }}
        />
        <StatCard
          label="In progress"
          value={dashboard.tasksByStatus.IN_PROGRESS ?? 0}
          sub="being worked on"
          subColor="var(--color-neutral-400)"
          icon={<SpinnerGap size={16} />}
          iconStyle={{ background: 'var(--color-accent-2-900)', color: 'var(--color-accent-2-300)' }}
        />
        <StatCard
          label="Overdue"
          value={dashboard.overdueTasks}
          sub={dashboard.overdueTasks ? 'past due date' : 'on track'}
          subColor={dashboard.overdueTasks ? 'oklch(.72 .12 25)' : 'oklch(.72 .12 150)'}
          icon={<ClockCountdown size={16} />}
          iconStyle={{ background: 'oklch(.3 .09 25)', color: 'oklch(.8 .1 30)' }}
        />
        <StatCard
          label="Open issues"
          value={dashboard.openIssues}
          sub={`${dashboard.totalIssues} total reported`}
          subColor="var(--color-neutral-400)"
          icon={<WarningCircle size={16} />}
          iconStyle={{ background: 'oklch(.32 .08 75)', color: 'oklch(.85 .1 85)' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card elev-sm" style={{ alignItems: 'center', gap: 14 }}>
          <div
            style={{
              fontSize: 13,
              alignSelf: 'flex-start',
              color: 'var(--color-neutral-300)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Overall progress
          </div>
          <ProgressRing value={dashboard.progress} />
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)', textAlign: 'center' }}>
            {dashboard.completedTasks} of {dashboard.totalTasks} tasks done
          </div>
        </div>
        <div className="card elev-sm">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)' }}>
              Tasks by status
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{dashboard.totalTasks} total</span>
          </div>
          <VerticalBars entries={statusEntries} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card elev-sm">
          <div
            style={{ fontSize: 13, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)', marginBottom: 10 }}
          >
            Tasks by priority
          </div>
          <HorizontalBars entries={priorityEntries} />
        </div>
        <div className="card elev-sm">
          <div
            style={{ fontSize: 13, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)', marginBottom: 10 }}
          >
            Issues by severity
          </div>
          <HorizontalBars entries={severityEntries} />
        </div>
      </div>

      <div className="card elev-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)' }}>
            Timeline
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Project schedule (Gantt)</span>
        </div>
        <Gantt tasks={tasks ?? []} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  subColor,
  icon,
  iconStyle,
}: {
  label: string;
  value: number;
  sub: string;
  subColor: string;
  icon: React.ReactNode;
  iconStyle: React.CSSProperties;
}) {
  return (
    <div className="card ph-card-lift elev-sm" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', ...iconStyle }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: subColor }}>{sub}</div>
    </div>
  );
}
