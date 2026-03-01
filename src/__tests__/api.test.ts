import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../lib/api';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends GET request by default', async () => {
    const mockData = { success: true, items: [] };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiFetch('/vehicles');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/vehicles'),
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      }),
    );
    expect(result).toEqual(mockData);
  });

  it('sends POST with JSON body', async () => {
    const mockResponse = { success: true, accessToken: 'tok123' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const body = { email: 'test-buyer@alphacar.com', password: 'Test1234x' };
    await apiFetch('/auth/login', { method: 'POST', body });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
  });

  it('includes Authorization header when token provided', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    await apiFetch('/auth/me', { token: 'my-jwt-token' });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer my-jwt-token',
        },
      }),
    );
  });

  it('throws error with server message on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    } as Response);

    await expect(apiFetch('/auth/login', { method: 'POST', body: {} })).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws error with fallback message when server returns error field', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal error' }),
    } as Response);

    await expect(apiFetch('/test')).rejects.toThrow('Internal error');
  });

  it('throws generic error when no message in response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(apiFetch('/test')).rejects.toThrow('Request failed (403)');
  });
});
