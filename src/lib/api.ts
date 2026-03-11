const API_BASE = import.meta.env.VITE_API_URL || 'https://api.alpha-tech.live';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // Session expired or replaced by another device — auto-logout
    if (res.status === 401 && token) {
      localStorage.removeItem('ac-token');
      window.location.href = '/';
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data.error?.message || data.message || `Request failed (${res.status})`);
  }

  return data as T;
}
