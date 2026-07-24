import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { ApiEnvelope } from '@/types/api';

/**
 * The JWT lives in an httpOnly cookie set by `POST /api/auth/login`, so every
 * request must send credentials. In dev, Vite proxies `/api` to the Express
 * server (see vite.config.ts) which keeps the cookie same-origin — that is
 * required because the backend sets `sameSite: 'strict'`.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** A failed request, normalised to the backend's `{ success, message }` shape. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Fired on any 401 so the auth layer can drop the cached user and redirect. */
export const UNAUTHORIZED_EVENT = 'projecthub:unauthorized';

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data as { message?: string } | undefined;
    const message =
      payload?.message ??
      (status === 0 ? 'Cannot reach the server. Is the API running?' : error.message);
    return new ApiError(status, message);
  }
  return new ApiError(0, error instanceof Error ? error.message : 'Unexpected error');
}

/** Unwraps `{ success, message, data }` and throws `ApiError` on failure. */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await http.request<ApiEnvelope<T>>(config);
    return res.data.data;
  } catch (error) {
    const apiError = toApiError(error);
    // `/auth/login` 401s are a wrong password, not an expired session.
    const isLoginAttempt = String(config.url ?? '').startsWith('/auth/');
    if (apiError.status === 401 && !isLoginAttempt) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    throw apiError;
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
};

/** True when the failure was the backend refusing on permissions, not an error. */
export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
