import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';

export function OAuthCallbackPage() {
  const { completeOAuthSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      try {
        await completeOAuthSignIn();
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    })();
    // Runs once — this page only ever exists for the duration of one redirect landing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingState label="Finishing sign-in…" />;
}
