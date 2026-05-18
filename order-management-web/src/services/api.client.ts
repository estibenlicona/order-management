import { supabase } from '@lib/supabase';

const BASE_URL = import.meta.env['VITE_API_URL'] as string;

export class UnauthorizedError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token === undefined) return {};
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse<T>(response: Response, path: string): Promise<T> {
  if (response.status === 401) {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new UnauthorizedError();
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`);
  }
  return (await response.json()) as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await authHeaders();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...auth, ...init?.headers },
    ...init,
  });
  return handleResponse<T>(response, path);
}

async function postWithTimeout<T>(path: string, body: unknown, timeoutMs = 600_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => postWithTimeout<T>(path, body),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
