import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { UNAUTHORIZED_EVENT } from '@/lib/api';
import { AUTH_STORAGE_KEY, AuthContext, type AuthContextValue } from '@/context/auth-context';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/api';

function readCachedUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // The session is just a localStorage read — synchronous, so no loading effect is needed.
  const [user, setUser] = useState<AuthUser | null>(() => readCachedUser());
  const ready = true;
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // Any 401 from any request means the cookie expired or was cleared.
  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clearSession]);

  // Signing out in one tab signs out the others.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) setUser(readCachedUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((nextUser: AuthUser) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async (input: LoginInput) => {
      const nextUser = await authApi.login(input);
      persist(nextUser);
      return nextUser;
    },
    [persist],
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      // Account is created as PENDING_VERIFICATION - no cookie yet, caller navigates to /verify-email.
      return authApi.register(input);
    },
    [],
  );

  const completeOAuthSignIn = useCallback(async () => {
    const nextUser = await authApi.me();
    persist(nextUser);
    return nextUser;
  }, [persist]);

  const verifyEmail = useCallback(
    async (input: { email: string; code: string }) => {
      const nextUser = await authApi.verifyEmail(input);
      persist(nextUser);
      return nextUser;
    },
    [persist],
  );

  const resetPassword = useCallback(
    async (input: { email: string; code: string; newPassword: string }) => {
      const nextUser = await authApi.resetPassword(input);
      persist(nextUser);
      return nextUser;
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signIn, signUp, signOut, completeOAuthSignIn, verifyEmail, resetPassword }),
    [user, ready, signIn, signUp, signOut, completeOAuthSignIn, verifyEmail, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
