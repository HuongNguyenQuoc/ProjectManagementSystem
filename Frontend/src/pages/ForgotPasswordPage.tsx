import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api';
import { forgotPassword } from '@/api/auth';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) return setError('Email is required');

    setSubmitting(true);
    try {
      await forgotPassword(email);
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
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
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Forgot your password?</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', marginBottom: 26 }}>
          Enter your email and we&apos;ll send you a code to reset it.
        </p>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          autoFocus
        />

        {error ? (
          <div className="field-error" style={{ marginTop: 10 }}>
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="primary" block loading={submitting} style={{ height: 42, marginTop: 16 }}>
          Send reset code
        </Button>
      </form>
    </div>
  );
}
