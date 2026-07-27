import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folders, TrashSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { TableCard } from '@/components/ui/TableCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useDeleteProject, useProjects } from '@/hooks/useProjects';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { PROJECT_STATUS, PROJECT_TYPE } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** Admin view of every project in the system, with a delete action. */
export function AdminProjectsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const deleteProject = useDeleteProject();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  usePageHeader({
    title: 'All Projects',
    subtitle: 'Every project in the system',
    search: { value: search, onChange: setSearch, placeholder: 'Search projects…' },
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects ?? [];
    return (projects ?? []).filter((project) => project.name.toLowerCase().includes(query));
  }, [projects, search]);

  async function handleDelete(projectId: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(projectId);
    try {
      await deleteProject.mutateAsync(projectId);
      showToast('Project deleted');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <LoadingState label="Loading projects…" />;
  if (isError) return <ErrorState error={new Error('Could not load projects')} onRetry={() => void refetch()} />;

  return (
    <div className="ph-screen">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{filtered.length} projects</span>
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={<Folders size={28} />}
          title="No projects found"
          description={search ? 'Try a different search.' : 'No projects have been created yet.'}
        />
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
                <th />
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
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
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
                    <td onClick={(event) => event.stopPropagation()}>
                      <Button
                        variant="icon"
                        title="Delete project"
                        loading={deletingId === project.id}
                        onClick={() => void handleDelete(project.id, project.name)}
                      >
                        <TrashSimple size={15} />
                      </Button>
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
