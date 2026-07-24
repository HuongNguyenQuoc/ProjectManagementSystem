import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { useCreateTask } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { TASK_PRIORITY } from '@/lib/constants';
import { TASK_PRIORITIES, type ProjectMemberDto, type TaskPriority } from '@/types/api';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMemberDto[];
}

/** "Add task" — leader only (enforced server-side by `createTaskService`). */
export function TaskFormModal({ open, onClose, projectId, members }: TaskFormModalProps) {
  const { showToast } = useToast();
  const createTask = useCreateTask(projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');
    setError(null);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setError(null);
    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
      });
      showToast('Task created');
      reset();
      onClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      title="Add task"
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={() => void handleSubmit()}
      submitLabel="Create task"
      submitting={createTask.isPending}
      error={error}
    >
      <TextField
        label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Build login endpoint"
        autoFocus
      />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Details…"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectField
          label="Priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
          options={TASK_PRIORITIES.map((key) => ({ value: key, label: TASK_PRIORITY[key].label }))}
        />
        <SelectField
          label="Assignee"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          placeholder="Unassigned"
          options={members.map((member) => ({ value: member.userId, label: member.fullName }))}
        />
      </div>
      <TextField
        label="Due date"
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />
    </Dialog>
  );
}
