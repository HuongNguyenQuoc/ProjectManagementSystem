import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Kanban } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { errorMessage } from '@/lib/api';

const FEATURES = ['Kanban boards with drag-and-drop', 'Role-based access per project', 'Issue tracking & live progress'];

export function LoginPage() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (ready && user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate to={from?.pathname ?? '/'} replace />;
  }

  const isRegister = mode === 'register';

  async function handleSubmit() {
    setError(null);
    if (isRegister && !fullName.trim()) return setError('Full name is required');
    if (!email.trim() || !password) return setError('Email and password are required');

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp({ fullName, email, password });
      } else {
        await signIn({ email, password });
      }
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ph-screen" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr .95fr' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(155deg, var(--color-section) 0%, var(--color-bg) 78%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--color-accent)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-bg)',
            }}
          >
            <Kanban size={19} weight="fill" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em' }}>
            ProjectHub
          </span>
        </div>

        <div style={{ maxWidth: 440 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-300)',
              marginBottom: 18,
            }}
          >
            Project Management System
          </div>
          <h1 style={{ marginBottom: 18 }}>Ship software the whole team can see.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>
            Plan projects, assign tasks, track progress and surface blockers — with role-based
            access for leaders and members.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 34 }}>
            {FEATURES.map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--color-accent-400)',
                    flex: 'none',
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--color-neutral-300)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
          Two roles · Project Leader &amp; Member
        </div>
        <div
          style={{
            position: 'absolute',
            right: -140,
            bottom: -160,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 26%, transparent), transparent 62%)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <form
          style={{ width: 'min(400px, 100%)' }}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <h2 style={{ fontSize: 27, marginBottom: 6 }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', marginBottom: 26 }}>
            {isRegister ? 'Start managing projects in minutes.' : 'Sign in to continue to ProjectHub.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 8 }}>
            {isRegister ? (
              <TextField
                label="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Cooper"
                autoFocus
              />
            ) : null}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="field-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting}
            style={{ height: 42, marginTop: 6 }}
          >
            {isRegister ? 'Create account' : 'Sign in'}
            <ArrowRight size={15} weight="bold" />
          </Button>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 20 }}>
            {isRegister ? 'Already have an account?' : 'New to ProjectHub?'}{' '}
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setError(null);
                setMode(isRegister ? 'login' : 'register');
              }}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
