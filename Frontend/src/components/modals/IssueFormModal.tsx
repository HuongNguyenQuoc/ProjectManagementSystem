import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { useCreateIssue } from '@/hooks/useIssues';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { ISSUE_SEVERITY } from '@/lib/constants';
import { ISSUE_SEVERITIES, type IssueSeverity } from '@/types/api';

interface IssueFormModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

/** "Report issue" — any member of the project may report one. */
export function IssueFormModal({ open, onClose, projectId }: IssueFormModalProps) {
  const { showToast } = useToast();
  const createIssue = useCreateIssue(projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle('');
    setDescription('');
    setSeverity('MEDIUM');
    setError(null);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    setError(null);
    try {
      await createIssue.mutateAsync({ title, description, severity });
      showToast('Issue reported');
      reset();
      onClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      title="Report issue"
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={() => void handleSubmit()}
      submitLabel="Submit"
      submitting={createIssue.isPending}
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
      <SelectField
        label="Severity"
        value={severity}
        onChange={(event) => setSeverity(event.target.value as IssueSeverity)}
        options={ISSUE_SEVERITIES.map((key) => ({ value: key, label: ISSUE_SEVERITY[key].label }))}
      />
    </Dialog>
  );
}
