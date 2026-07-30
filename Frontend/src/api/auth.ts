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
