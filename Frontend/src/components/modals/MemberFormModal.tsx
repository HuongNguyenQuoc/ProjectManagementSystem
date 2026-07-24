import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MagnifyingGlass } from '@phosphor-icons/react';
import * as usersApi from '@/api/users';
import type { UserLookupResult } from '@/api/users';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/Field';
import { useAddProjectMember } from '@/hooks/useProjects';
import { useToast } from '@/hooks/useToast';
import { errorMessage } from '@/lib/api';
import { MEMBER_POSITION } from '@/lib/constants';
import { MEMBER_POSITIONS, type MemberPosition } from '@/types/api';

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** So a teammate who is already on the project can't be looked up again. */
  existingUserIds: string[];
}

/**
 * The backend has no user directory — only `GET /api/users/lookup?email=`
 * (an exact-match lookup added alongside this UI). So "Add member" is a
 * two-step flow: find the person by email, then confirm their position.
 */
export function MemberFormModal({ open, onClose, projectId, existingUserIds }: MemberFormModalProps) {
  const { showToast } = useToast();
  const addMember = useAddProjectMember(projectId);

  const [email, setEmail] = useState('');
  const [found, setFound] = useState<UserLookupResult | null>(null);
  const [position, setPosition] = useState<MemberPosition>('FRONTEND_DEVELOPER');
  const [error, setError] = useState<string | null>(null);

  const lookup = useMutation({
    mutationFn: (value: string) => usersApi.lookupUserByEmail(value),
  });

  function reset() {
    setEmail('');
    setFound(null);
    setPosition('FRONTEND_DEVELOPER');
    setError(null);
    lookup.reset();
  }

  async function handleFind() {
    if (!email.trim()) return;
    setError(null);
    setFound(null);
    try {
      const result = await lookup.mutateAsync(email.trim());
      if (existingUserIds.includes(result.id)) {
        setError('This person is already a member of the project');
        return;
      }
      setFound(result);
    } catch (lookupError) {
      setError(errorMessage(lookupError, 'No user found with this email'));
    }
  }

  async function handleSubmit() {
    if (!found) {
      setError('Find a person by email first');
      return;
    }
    setError(null);
    try {
      await addMember.mutateAsync({ userId: found.id, position });
      showToast('Member added');
      reset();
      onClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      title="Add member"
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={() => void handleSubmit()}
      submitLabel="Add member"
      submitting={addMember.isPending}
      submitDisabled={!found}
      error={error}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <TextField
            label="Teammate's email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFound(null);
            }}
            placeholder="teammate@company.com"
            autoFocus
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => void handleFind()}
          loading={lookup.isPending}
          style={{ height: 38 }}
        >
          <MagnifyingGlass size={15} />
          Find
        </Button>
      </div>

      {found ? (
        <div
          className="card"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}
        >
          <Avatar name={found.fullName} colorKey={found.id} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>{found.fullName}</div>
            <div className="ph-truncate" style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>
              {found.email}
            </div>
          </div>
        </div>
      ) : null}

      <SelectField
        label="Position"
        value={position}
        onChange={(event) => setPosition(event.target.value as MemberPosition)}
        options={MEMBER_POSITIONS.map((key) => ({ value: key, label: MEMBER_POSITION[key] }))}
        disabled={!found}
      />
    </Dialog>
  );
}
