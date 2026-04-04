const API_BASE = import.meta.env.VITE_API_URL || 'https://api.alpha-tech.live';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('ac-refresh-token');
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('REFRESH_FAILED');

  const data = await res.json();
  if (!data.accessToken) throw new Error('REFRESH_FAILED');

  // Save new tokens
  localStorage.setItem('ac-token', data.accessToken);
  if (data.refreshToken) localStorage.setItem('ac-refresh-token', data.refreshToken);

  return data.accessToken;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  let token = options.token || localStorage.getItem('ac-token');

  const doFetch = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(`${API_BASE}/api/v1${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(token);

  // 401 — try refresh token
  if (res.status === 401 && token) {
    const data = await res.json().catch(() => ({}));

    // Session replaced — logout immediately
    if (data?.message === 'SESSION_REPLACED') {
      localStorage.removeItem('ac-token');
      localStorage.removeItem('ac-refresh-token');
      window.location.href = '/login';
      throw new Error('SESSION_REPLACED');
    }

    // Try refresh
    try {
      let newToken: string;

      if (isRefreshing) {
        // Wait for ongoing refresh
        newToken = await new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        });
      } else {
        isRefreshing = true;
        try {
          newToken = await refreshAccessToken();
          // Resolve all queued requests
          refreshQueue.forEach(({ resolve }) => resolve(newToken));
          refreshQueue = [];
        } catch (err) {
          refreshQueue.forEach(({ reject }) => reject(err as Error));
          refreshQueue = [];
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Retry with new token
      res = await doFetch(newToken);
    } catch {
      // Refresh failed — logout
      localStorage.removeItem('ac-token');
      localStorage.removeItem('ac-refresh-token');
      window.location.href = '/login';
      throw new Error('SESSION_EXPIRED');
    }
  }

  const responseData = await res.json();

  if (!res.ok) {
    const err = new Error(responseData.error || responseData.message || `Request failed (${res.status})`) as any;
    err.status = res.status;
    err.rateLimited = responseData.rateLimited || false;
    err.retryAfterMs = responseData.retryAfterMs || 0;
    err.quota = responseData.quota || null;
    throw err;
  }

  return responseData as T;
}
