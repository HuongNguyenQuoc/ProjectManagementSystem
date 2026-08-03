import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { errorMessage } from '@/lib/api';
import { resendVerification } from '@/api/auth';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const verifiedEmail = email;

  async function handleSubmit() {
    setError(null);
    if (!code.trim()) return setError('Please enter the verification code');
    setSubmitting(true);
    try {
      await verifyEmail({ email: verifiedEmail, code });
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendVerification(verifiedEmail);
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((seconds) => {
          if (seconds <= 1) {
            clearInterval(timer);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } catch (resendError) {
      setError(errorMessage(resendError));
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
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Verify your email</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', marginBottom: 26 }}>
          We sent a 6-digit verification code to {verifiedEmail}. Enter it below to verify your email and complete your registration.
        </p>

        <TextField
          label="Verification code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          autoFocus
        />

        {error ? (
          <div className="field-error" style={{ marginTop: 10 }}>
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="primary" block loading={submitting} style={{ height: 42, marginTop: 16 }}>
          Verify
        </Button>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 20 }}>
          Didn&apos;t get a code?{' '}
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={() => void handleResend()}
            style={{
              fontFamily: 'var(--font-heading)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: resendCooldown > 0 ? 'default' : 'pointer',
            }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </div>
  );
}
