import { api } from '@/lib/api';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/api';

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
