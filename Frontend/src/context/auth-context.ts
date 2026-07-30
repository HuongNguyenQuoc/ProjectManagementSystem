import { createContext } from 'react';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/api';

export interface AuthContextValue {
  user: AuthUser | null;
  /** False only during the first read of the cached session. */
  ready: boolean;
  signIn: (input: LoginInput) => Promise<AuthUser>;
  signUp: (input: RegisterInput) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  completeOAuthSignIn: () => Promise<AuthUser>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The JWT itself lives in an httpOnly cookie we cannot read, so the
 * *identity* is cached here separately (normal login/register responses
 * already return it; `GET /auth/me` only exists for the OAuth redirect flow,
 * which has nowhere else to hand the user back to the frontend).
 * The cookie stays the only thing that authorises a request — this is just a
 * label for the UI, and any 401 clears it.
 */
export const AUTH_STORAGE_KEY = 'projecthub.user';
