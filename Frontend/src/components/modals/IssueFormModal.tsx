import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { useCreateIssue, useUpdateIssue } from '@/hooks/useIssues';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { ISSUE_SEVERITY, ISSUE_STATUS } from '@/lib/constants';
import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  type IssueListItem,
  type IssueSeverity,
  type IssueStatus,
  type ProjectMemberDto,
} from '@/types/api';

interface IssueFormModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** Present when editing; omit to report a new issue. */
  issue?: IssueListItem;
  /** Leader gets the full form (severity/status/assignee); a reporter editing their own issue only gets title/description. */
  isLeader: boolean;
  /** Only needed for the leader's assignee select. */
  members?: ProjectMemberDto[];
}

/**
 * "Report issue" (create, any member) and "Edit issue" (leader, or the
 * reporter editing their own — see `updateIssueService` for the exact rule).
 */
export function IssueFormModal({ open, onClose, projectId, issue, isLeader, members = [] }: IssueFormModalProps) {
  const { showToast } = useToast();
  const createIssue = useCreateIssue(projectId);
  const updateIssue = useUpdateIssue(projectId);
  const isEdit = Boolean(issue);
  const canEditFull = isEdit && isLeader;

  const [title, setTitle] = useState(issue?.title ?? '');
  const [description, setDescription] = useState(issue?.description ?? '');
  const [severity, setSeverity] = useState<IssueSeverity>(issue?.severity ?? 'MEDIUM');
  const [status, setStatus] = useState<IssueStatus>(issue?.status ?? 'OPEN');
  const [assignedTo, setAssignedTo] = useState(issue?.assigneeId ?? '');
  const [error, setError] = useState<string | null>(null);

  const pending = createIssue.isPending || updateIssue.isPending;

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    setError(null);
    try {
      if (isEdit && issue) {
        await updateIssue.mutateAsync({
          issueId: issue.id,
          input: canEditFull
            ? { title, description, severity, status, assignedTo: assignedTo || undefined }
            : { title, description },
        });
        showToast('Issue updated');
      } else {
        await createIssue.mutateAsync({ title, description, severity });
        showToast('Issue reported');
      }
      onClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      title={isEdit ? 'Edit issue' : 'Report issue'}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      submitLabel={isEdit ? 'Save changes' : 'Submit'}
      submitting={pending}
      error={error}
    >
      <TextField
        label="Issue title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Login fails on Safari"
        autoFocus
      />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Steps to reproduce…"
      />
      {!isEdit || canEditFull ? (
        <SelectField
          label="Severity"
          value={severity}
          onChange={(event) => setSeverity(event.target.value as IssueSeverity)}
          options={ISSUE_SEVERITIES.map((key) => ({ value: key, label: ISSUE_SEVERITY[key].label }))}
        />
      ) : null}
      {canEditFull ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as IssueStatus)}
            options={ISSUE_STATUSES.map((key) => ({ value: key, label: ISSUE_STATUS[key].label }))}
          />
          <SelectField
            label="Assignee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            placeholder="Unassigned"
            options={members.map((member) => ({ value: member.userId, label: member.fullName }))}
          />
        </div>
      ) : null}
    </Dialog>
  );
}
