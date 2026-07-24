import { createContext } from 'react';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/api';

export interface AuthContextValue {
  user: AuthUser | null;
  /** False only during the first read of the cached session. */
  ready: boolean;
  signIn: (input: LoginInput) => Promise<AuthUser>;
  signUp: (input: RegisterInput) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The JWT itself lives in an httpOnly cookie we cannot read, and the backend
 * exposes no `GET /auth/me`, so the *identity* is cached here separately.
 * The cookie stays the only thing that authorises a request — this is just a
 * label for the UI, and any 401 clears it.
 */
export const AUTH_STORAGE_KEY = 'projecthub.user';
