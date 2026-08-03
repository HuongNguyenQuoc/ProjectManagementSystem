import { api, API_BASE_URL } from '@/lib/api';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/api';

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export function oauthUrl(provider: OAuthProvider): string {
  return `${API_BASE_URL}/auth/${provider}`;
}

export function me() {
  return api.get<AuthUser>('/auth/me');
}

/** `POST /api/auth/register` → 201, returns the user without its password. */
export function register(input: RegisterInput) {
  return api.post<AuthUser>('/auth/register', input);
}

/** `POST /api/auth/login` → sets the httpOnly JWT cookie, returns `{ user }`. */
export async function login(input: LoginInput): Promise<AuthUser> {
  const data = await api.post<{ user: AuthUser }>('/auth/login', input);
  return data.user;
}

/** `POST /api/auth/logout` → clears the cookie. */
export function logout() {
  return api.post<never>('/auth/logout');
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

/** `POST /api/auth/verify-email` -> sets the httpOnly JWT cookie. returns `{ user }. */
export async function verifyEmail(input: VerifyEmailInput): Promise<AuthUser> {
  const data = await api.post<{ user: AuthUser }>('/auth/verify-email', input);
  return data.user;
}

export function resendVerification(email: string) {
  return api.post<never>('/auth/resend-verification', { email });
}

export function forgotPassword(email: string) {
  return api.post<never>('/auth/forgot-password', { email });
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

/** `POST /api/auth/reset-password` -> sets the httpOnly JWT cookie. returns `{ user }`. */

export async function resetPassword(input: ResetPasswordInput): Promise<AuthUser> {
  const data = await api.post<{ user: AuthUser }>('/auth/reset-password', input);
  return data.user;
}

