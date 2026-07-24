import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Kanban,
  ListChecks,
  PencilSimple,
  Plus,
  Rows,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { KanbanBoard } from '@/components/task/KanbanBoard';
import { TaskTable } from '@/components/task/TaskTable';
import { TaskDrawer } from '@/components/task/TaskDrawer';
import { IssuesTable } from '@/components/project/IssuesTable';
import { MembersGrid } from '@/components/project/MembersGrid';
import { ProjectFormModal } from '@/components/modals/ProjectFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { IssueFormModal } from '@/components/modals/IssueFormModal';
import { MemberFormModal } from '@/components/modals/MemberFormModal';
import { useAuth } from '@/hooks/useAuth';
import { useActiveProjectContext } from '@/hooks/useActiveProjectContext';
import { useProject, useProjectRole, useRemoveProjectMember } from '@/hooks/useProjects';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useIssues } from '@/hooks/useIssues';
import { usePageHeader } from '@/hooks/usePageHeader';
import { useToast } from '@/hooks/useToast';
import { errorMessage, isForbidden } from '@/lib/api';
import { PROJECT_TYPE } from '@/lib/constants';
import type { TaskStatus } from '@/types/api';

type Tab = 'board' | 'issues' | 'members';
type BoardView = 'kanban' | 'table';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { selectProject } = useActiveProjectContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [boardView, setBoardView] = useState<BoardView>('kanban');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) selectProject(projectId);
  }, [projectId, selectProject]);

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectFetchError,
    refetch: refetchProject,
  } = useProject(projectId);
  const role = useProjectRole(project);
  const isLeader = role === 'PROJECT_LEADER';
  const isMember = role !== null;

  const { data: tasks, isLoading: tasksLoading } = useTasks(isMember ? projectId : undefined);
  const { data: issues, isLoading: issuesLoading } = useIssues(isMember ? projectId : undefined);
  const updateTask = useUpdateTask(projectId ?? '');
  const removeMember = useRemoveProjectMember(projectId ?? '');
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const tab = (searchParams.get('tab') as Tab | null) ?? 'board';
  const openTaskId = searchParams.get('task');

  usePageHeader({
    title: project?.name ?? 'Project',
    subtitle: 'Board · tasks · issues · members',
  });

  function setTab(next: Tab) {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('tab', next);
      nextParams.delete('task');
      return nextParams;
    });
  }

  function openTask(taskId: string) {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('task', taskId);
      return nextParams;
    });
  }

  function closeTask() {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.delete('task');
      return nextParams;
    });
  }

  function moveTask(taskId: string, status: TaskStatus) {
    updateTask.mutate(
      { taskId, input: status === 'DONE' ? { status, progress: 100 } : { status } },
      { onError: (error) => showToast(errorMessage(error), 'error') },
    );
  }

  async function handleRemoveMember(userId: string) {
    setRemovingUserId(userId);
    try {
      await removeMember.mutateAsync(userId);
      showToast('Member removed');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    } finally {
      setRemovingUserId(null);
    }
  }

  if (projectLoading) return <LoadingState label="Loading project…" />;
  // A 403 here just means "not a member" — that gets its own friendlier
  // empty state below, not the generic error screen.
  if (projectError && !isForbidden(projectFetchError)) {
    return <ErrorState error={projectFetchError} onRetry={() => void refetchProject()} />;
  }
  if (!project || !isMember) {
    return (
      <EmptyState
        title="You're not a member of this project"
        description="Ask the project leader to add you as a member to see its board, issues and members."
      />
    );
  }

  const type = PROJECT_TYPE[project.projectType];
  const Icon = type.icon;
  const openTask_ = tasks?.find((task) => task.id === openTaskId);

  return (
    <div className="ph-screen">
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          navigate('/projects');
        }}
        style={{
          fontSize: 13,
          color: 'var(--color-neutral-400)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 14,
        }}
      >
        <ArrowLeft size={14} /> All projects
      </a>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-accent-900)',
            color: 'var(--color-accent-300)',
            flex: 'none',
          }}
        >
          <Icon size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 26 }}>{project.name}</h2>
          </div>
          {project.description ? (
            <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 4, maxWidth: 640 }}>
              {project.description}
            </div>
          ) : null}
        </div>
        {isLeader ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => setProjectModalOpen(true)}>
              <PencilSimple size={14} />
              Edit
            </Button>
            <Button variant="primary" onClick={() => setTaskModalOpen(true)}>
              <Plus size={14} weight="bold" />
              Add task
            </Button>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid var(--color-divider)',
          marginBottom: 20,
        }}
      >
        <button type="button" className={`ph-tab${tab === 'board' ? ' is-active' : ''}`} onClick={() => setTab('board')}>
          <Kanban size={15} /> Board
        </button>
        <button type="button" className={`ph-tab${tab === 'issues' ? ' is-active' : ''}`} onClick={() => setTab('issues')}>
          <WarningCircle size={15} /> Issues <span style={{ color: 'var(--color-neutral-500)' }}>{issues?.length ?? 0}</span>
        </button>
        <button type="button" className={`ph-tab${tab === 'members' ? ' is-active' : ''}`} onClick={() => setTab('members')}>
          <UsersThree size={15} /> Members <span style={{ color: 'var(--color-neutral-500)' }}>{project.members.length}</span>
        </button>

        {tab === 'board' ? (
          <Segmented
            value={boardView}
            onChange={setBoardView}
            ariaLabel="Board view"
            style={{ marginLeft: 'auto' }}
            options={[
              { value: 'kanban', label: 'Board', icon: <Kanban size={14} /> },
              { value: 'table', label: 'List', icon: <Rows size={14} /> },
            ]}
          />
        ) : null}
      </div>

      {tab === 'board' &&
        (tasksLoading ? (
          <LoadingState label="Loading tasks…" />
        ) : !tasks?.length ? (
          <EmptyState
            icon={<ListChecks size={28} />}
            title="No tasks yet"
            description={isLeader ? 'Add the first task to get the board moving.' : 'Tasks the leader creates will show up here.'}
          />
        ) : boardView === 'kanban' ? (
          <KanbanBoard tasks={tasks} onOpenTask={openTask} onMoveTask={moveTask} canDragStatus={isLeader} />
        ) : (
          <TaskTable tasks={tasks} onOpenTask={openTask} />
        ))}

      {tab === 'issues' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>
              {issues?.length ?? 0} issues reported
            </span>
            <Button variant="primary" onClick={() => setIssueModalOpen(true)} style={{ marginLeft: 'auto' }}>
              <Plus size={14} weight="bold" />
              Report issue
            </Button>
          </div>
          {issuesLoading ? <LoadingState label="Loading issues…" /> : <IssuesTable issues={issues ?? []} />}
        </div>
      )}

      {tab === 'members' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{project.members.length} members</span>
            {isLeader ? (
              <Button variant="primary" onClick={() => setMemberModalOpen(true)} style={{ marginLeft: 'auto' }}>
                <Plus size={14} weight="bold" />
                Add member
              </Button>
            ) : null}
          </div>
          <MembersGrid
            members={project.members}
            tasks={tasks ?? []}
            canManage={isLeader}
            onRemove={(userId) => void handleRemoveMember(userId)}
            removingUserId={removingUserId}
          />
        </div>
      )}

      {openTask_ && projectId ? (
        <TaskDrawer
          task={openTask_}
          projectId={projectId}
          projectName={project.name}
          isLeader={isLeader}
          isAssignee={openTask_.assigneeId === user?.id}
          onClose={closeTask}
        />
      ) : null}

      {projectId ? (
        <>
          <ProjectFormModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} project={project} />
          <TaskFormModal
            open={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
            projectId={projectId}
            members={project.members}
          />
          <IssueFormModal open={issueModalOpen} onClose={() => setIssueModalOpen(false)} projectId={projectId} />
          <MemberFormModal
            open={memberModalOpen}
            onClose={() => setMemberModalOpen(false)}
            projectId={projectId}
            existingUserIds={project.members.map((member) => member.userId)}
          />
        </>
      ) : null}
    </div>
  );
}
