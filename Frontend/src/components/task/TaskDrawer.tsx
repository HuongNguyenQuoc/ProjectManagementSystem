import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlank, PaperPlaneTilt, X } from '@phosphor-icons/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatusDot, Tag } from '@/components/ui/Tag';
import { LoadingState } from '@/components/ui/States';
import { formatDate, relativeTime, taskCode } from '@/lib/format';
import { BOARD_COLUMNS, TASK_PRIORITY, TASK_STATUS } from '@/lib/constants';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useUpdateTask } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import type { TaskListItem, TaskStatus } from '@/types/api';

interface TaskDrawerProps {
  task: TaskListItem;
  projectId: string;
  projectName: string;
  isLeader: boolean;
  isAssignee: boolean;
  onClose: () => void;
}

const DRAWER_STATUS_OPTIONS: TaskStatus[] = [...BOARD_COLUMNS, 'CANCELLED'];

export function TaskDrawer({ task, projectId, projectName, isLeader, isAssignee, onClose }: TaskDrawerProps) {
  const { showToast } = useToast();
  const updateTask = useUpdateTask(projectId);
  const { data: comments, isLoading: commentsLoading } = useComments(projectId, task.id);
  const createComment = useCreateComment(projectId, task.id);
  const [commentDraft, setCommentDraft] = useState('');
  const [progress, setProgress] = useState(task.progress);
  // Reset the slider whenever the drawer is pointed at a different task —
  // derived during render (React's recommended alternative to an effect).
  const [syncedTaskId, setSyncedTaskId] = useState(task.id);
  if (syncedTaskId !== task.id) {
    setSyncedTaskId(task.id);
    setProgress(task.progress);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const canEditProgress = isLeader || isAssignee;
  const priority = TASK_PRIORITY[task.priority];
  const status = TASK_STATUS[task.status];

  function commitProgress(value: number) {
    if (value === task.progress) return;
    updateTask.mutate(
      { taskId: task.id, input: { progress: value } },
      { onError: (error) => showToast(errorMessage(error), 'error') },
    );
  }

  function setStatus(nextStatus: TaskStatus) {
    if (nextStatus === task.status) return;
    updateTask.mutate(
      { taskId: task.id, input: { status: nextStatus } },
      { onError: (error) => showToast(errorMessage(error), 'error') },
    );
  }

  async function submitComment() {
    const text = commentDraft.trim();
    if (!text || createComment.isPending) return;
    // Clear immediately so a fast double Enter/click can't resubmit the same text.
    setCommentDraft('');
    try {
      await createComment.mutateAsync(text);
    } catch (error) {
      setCommentDraft(text);
      showToast(errorMessage(error), 'error');
    }
  }

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="ph-fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'color-mix(in srgb, var(--color-neutral-900) 55%, transparent)',
          zIndex: 40,
        }}
      />
      <div
        className="ph-slide-in"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(480px, 100%)',
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 41,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px 22px',
            borderBottom: '1px solid var(--color-divider)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginBottom: 5 }}>
              {taskCode(task.id)} · {projectName}
            </div>
            <div style={{ fontSize: 19, fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
              {task.title}
            </div>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <Tag style={priority.tag}>{priority.label}</Tag>
            <Tag>
              <StatusDot color={status.color} label={status.label} />
            </Tag>
          </div>

          {task.description ? (
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>
              {task.description}
            </p>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              margin: '20px 0',
              fontSize: 13,
            }}
          >
            <div>
              <div style={{ color: 'var(--color-neutral-500)', fontSize: 11, marginBottom: 4 }}>
                Assignee
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={task.assigneeName} colorKey={task.assigneeId} size={26} />
                {task.assigneeName ?? 'Unassigned'}
              </span>
            </div>
            <div>
              <div style={{ color: 'var(--color-neutral-500)', fontSize: 11, marginBottom: 4 }}>
                Due date
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarBlank size={14} />
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>

          <div style={{ margin: '20px 0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)' }}>
                Progress
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent-300)' }}>
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              disabled={!canEditProgress}
              onChange={(event) => setProgress(Number(event.target.value))}
              onMouseUp={(event) => commitProgress(Number(event.currentTarget.value))}
              onTouchEnd={(event) => commitProgress(Number(event.currentTarget.value))}
              onKeyUp={(event) => commitProgress(Number(event.currentTarget.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 6 }}>
              {canEditProgress
                ? 'Drag to update — reaching 100% marks the task Done.'
                : 'Only the assignee or the project leader can update progress.'}
            </div>
          </div>

          {isLeader ? (
            <div style={{ margin: '20px 0' }}>
              <div
                style={{
                  color: 'var(--color-neutral-300)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {DRAWER_STATUS_OPTIONS.map((key) => {
                  const meta = TASK_STATUS[key];
                  const active = task.status === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className="ph-row-btn"
                      onClick={() => setStatus(key)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        padding: '6px 11px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background: active
                          ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
                          : 'transparent',
                        color: 'var(--color-text)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div style={{ borderTop: '1px solid var(--color-divider)', marginTop: 22, paddingTop: 18 }}>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-neutral-300)',
                fontFamily: 'var(--font-heading)',
                marginBottom: 14,
              }}
            >
              Comments <span style={{ color: 'var(--color-neutral-500)' }}>{comments?.length ?? 0}</span>
            </div>

            {commentsLoading ? (
              <LoadingState label="Loading comments…" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                {comments?.map((comment) => (
                  <div key={comment.id} style={{ display: 'flex', gap: 10 }}>
                    <Avatar name={comment.authorName} colorKey={comment.authorId} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-heading)' }}>
                          {comment.authorName}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                          {relativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-neutral-300)', lineHeight: 1.5, marginTop: 2 }}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                className="input"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void submitComment();
                  }
                }}
                placeholder="Add a comment…"
                style={{ minHeight: 44, height: 44 }}
              />
              <Button
                variant="primary"
                onClick={() => void submitComment()}
                loading={createComment.isPending}
                disabled={!commentDraft.trim()}
                style={{ height: 44, flex: 'none' }}
              >
                <PaperPlaneTilt size={15} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
