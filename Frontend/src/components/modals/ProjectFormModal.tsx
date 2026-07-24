import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { MEMBER_POSITION, PROJECT_STATUS, PROJECT_TYPE } from '@/lib/constants';
import { toDateInputValue } from '@/lib/format';
import {
  MEMBER_POSITIONS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type MemberPosition,
  type ProjectDetail,
  type ProjectStatus,
  type ProjectType,
} from '@/types/api';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Present only when editing; its id drives the update call. */
  project?: ProjectDetail;
  onSaved?: (projectId: string) => void;
}

/**
 * `status` and `position` only exist on one side of the backend's split:
 * `CreateProjectInput` takes `position` (the creator's role) but no
 * `status` (always starts PLANNING); `UpdateProjectInput` takes `status`
 * but no `position` (membership is already settled by then).
 */
export function ProjectFormModal({ open, onClose, project, onSaved }: ProjectFormModalProps) {
  const isEdit = Boolean(project);
  const { showToast } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(project?.id ?? '');

  const [name, setName] = useState(project?.name ?? '');
  const [projectType, setProjectType] = useState<ProjectType>(project?.projectType ?? 'WEB');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'PLANNING');
  const [position, setPosition] = useState<MemberPosition>('BACKEND_DEVELOPER');
  const [description, setDescription] = useState(project?.description ?? '');
  const [startDate, setStartDate] = useState(toDateInputValue(project?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(project?.endDate));
  const [error, setError] = useState<string | null>(null);

  const pending = createProject.isPending || updateProject.isPending;

  function resetAndClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError(null);
    try {
      if (isEdit && project) {
        await updateProject.mutateAsync({
          name,
          projectType,
          status,
          description: description || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        showToast('Project saved');
        onSaved?.(project.id);
      } else {
        const created = await createProject.mutateAsync({
          name,
          position,
          projectType,
          description: description || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        showToast('Project created');
        onSaved?.(created.id);
      }
      resetAndClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      title={isEdit ? 'Edit project' : 'New project'}
      onClose={resetAndClose}
      onSubmit={() => void handleSubmit()}
      submitLabel={isEdit ? 'Save project' : 'Create project'}
      submitting={pending}
      error={error}
    >
      <TextField
        label="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Nova Payments Platform"
        autoFocus
      />
      <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr', gap: 12 }}>
        <SelectField
          label="Type"
          value={projectType}
          onChange={(event) => setProjectType(event.target.value as ProjectType)}
          options={PROJECT_TYPES.map((key) => ({ value: key, label: PROJECT_TYPE[key].label }))}
        />
        {isEdit ? (
          <SelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
            options={PROJECT_STATUSES.map((key) => ({ value: key, label: PROJECT_STATUS[key].label }))}
          />
        ) : null}
      </div>
      {!isEdit ? (
        <SelectField
          label="Your position on this project"
          hint="You become the project leader — this is your role on the team."
          value={position}
          onChange={(event) => setPosition(event.target.value as MemberPosition)}
          options={MEMBER_POSITIONS.map((key) => ({ value: key, label: MEMBER_POSITION[key] }))}
        />
      ) : null}
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="What is this project about?"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField
          label="Start date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <TextField
          label="End date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
    </Dialog>
  );
}
