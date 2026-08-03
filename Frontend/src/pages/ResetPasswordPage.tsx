import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { errorMessage } from '@/lib/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const targetEmail = email;

  async function handleSubmit() {
    setError(null);
    if (!code.trim() || !newPassword) return setError('Code and new password are required');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setSubmitting(true);
    try {
      await resetPassword({ email: targetEmail, code, newPassword });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <form
        style={{ width: 'min(380px, 100%)' }}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Reset your password</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', marginBottom: 26 }}>
          Enter the code sent to {targetEmail} and choose a new password.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextField
            label="Reset code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            autoFocus
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••••"
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <div className="field-error" style={{ marginTop: 10 }}>
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="primary" block loading={submitting} style={{ height: 42, marginTop: 16 }}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
