import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarBlank, Plus, Rows, SquaresFour } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Segmented } from '@/components/ui/Segmented';
import { Tag } from '@/components/ui/Tag';
import { TableCard } from '@/components/ui/TableCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { useActiveProjectContext } from '@/hooks/useActiveProjectContext';
import { useProjects } from '@/hooks/useProjects';
import { usePageHeader } from '@/hooks/usePageHeader';
import { PROJECT_STATUS, PROJECT_TYPE } from '@/lib/constants';
import { formatDate, initials } from '@/lib/format';
import { Folders } from '@phosphor-icons/react';

type ViewMode = 'grid' | 'table';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { selectProject } = useActiveProjectContext();
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  usePageHeader({
    title: 'Projects',
    subtitle: 'All projects you can access',
    search: { value: search, onChange: setSearch, placeholder: 'Search projects…' },
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects ?? [];
    return (projects ?? []).filter((project) => project.name.toLowerCase().includes(query));
  }, [projects, search]);

  function openProject(projectId: string) {
    selectProject(projectId);
    navigate(`/projects/${projectId}`);
  }

  if (isLoading) return <LoadingState label="Loading projects…" />;
  if (isError) return <ErrorState error={new Error('Could not load projects')} onRetry={() => void refetch()} />;

  return (
    <div className="ph-screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Segmented
          value={view}
          onChange={setView}
          ariaLabel="Project view"
          options={[
            { value: 'grid', label: 'Cards', icon: <SquaresFour size={14} /> },
            { value: 'table', label: 'Table', icon: <Rows size={14} /> },
          ]}
        />
        <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{filtered.length} projects</span>
        <Button variant="primary" onClick={() => setModalOpen(true)} style={{ marginLeft: 'auto' }}>
          <Plus size={14} weight="bold" />
          New project
        </Button>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={<Folders size={28} />}
          title="No projects found"
          description={search ? 'Try a different search.' : 'Create your first project to get started.'}
        />
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map((project) => {
            const type = PROJECT_TYPE[project.projectType];
            const status = PROJECT_STATUS[project.status];
            const Icon = type.icon;
            return (
              <div
                key={project.id}
                className="card ph-card-lift elev-sm"
                onClick={() => openProject(project.id)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--color-accent-900)',
                      color: 'var(--color-accent-300)',
                    }}
                  >
                    <Icon size={19} />
                  </div>
                  <Tag style={status.tag}>{status.label}</Tag>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 2 }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{type.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--color-neutral-400)' }}>
                    {project.completedTask}/{project.totalTask} tasks
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)' }}>{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
                <div className="card-meta" style={{ justifyContent: 'space-between', paddingTop: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'var(--color-accent-800)',
                        color: 'var(--color-accent-100)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 10,
                      }}
                    >
                      {initials(project.leaderName)}
                    </span>
                    {project.leaderName ?? '—'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarBlank size={13} />
                    {formatDate(project.deadline)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <TableCard>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Type</th>
                <th>Leader</th>
                <th>Tasks</th>
                <th style={{ width: 150 }}>Progress</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const type = PROJECT_TYPE[project.projectType];
                const status = PROJECT_STATUS[project.status];
                return (
                  <tr
                    key={project.id}
                    className="ph-row-btn"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openProject(project.id)}
                  >
                    <td style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</td>
                    <td style={{ color: 'var(--color-neutral-400)' }}>{type.label}</td>
                    <td>{project.leaderName ?? '—'}</td>
                    <td>
                      {project.completedTask}/{project.totalTask}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar value={project.progress} />
                        </div>
                        <span style={{ fontSize: 12, width: 32 }}>{project.progress}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-neutral-400)' }}>{formatDate(project.deadline)}</td>
                    <td>
                      <Tag style={status.tag}>{status.label}</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
      )}

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(projectId) => openProject(projectId)}
      />
    </div>
  );
}
