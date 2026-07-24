import { api } from '@/lib/api';

export interface UserLookupResult {
  id: string;
  fullName: string;
  email: string;
}

/** `GET /api/users/lookup?email=` — the only user directory read the backend exposes. */
export function lookupUserByEmail(email: string) {
  return api.get<UserLookupResult>('/users/lookup', { params: { email } });
}
