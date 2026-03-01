import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock the api module
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../lib/api';

const mockUser = {
  _id: 'user1',
  displayName: 'Test Buyer',
  email: 'test-buyer@alphacar.com',
  role: 'buyer',
};

function AuthConsumer() {
  const { user, token, loading, error, login, oauthLogin, logout, deleteAccount, clearError } =
    useAuth();

  return (
    <div>
      <span data-testid="user">{user ? user.displayName : 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error || 'none'}</span>
      <button data-testid="login" onClick={() => login('test-buyer@alphacar.com', 'Test1234x').catch(() => {})}>
        Login
      </button>
      <button data-testid="oauth" onClick={() => oauthLogin('id-token', 'google').catch(() => {})}>
        OAuth
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
      <button data-testid="delete" onClick={() => deleteAccount().catch(() => {})}>
        Delete
      </button>
      <button data-testid="clear-error" onClick={clearError}>
        Clear
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    localStorage.clear();
  });

  it('starts with no user and no token', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('login sets user and token on success', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue({
      success: true,
      accessToken: 'jwt-123',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test Buyer');
      expect(screen.getByTestId('token')).toHaveTextContent('jwt-123');
    });

    expect(localStorage.getItem('ac-token')).toBe('jwt-123');
    expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'test-buyer@alphacar.com', password: 'Test1234x' },
    });
  });

  it('login sets error on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('oauthLogin sets user and token on success', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue({
      success: true,
      accessToken: 'oauth-jwt',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('oauth'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test Buyer');
      expect(screen.getByTestId('token')).toHaveTextContent('oauth-jwt');
    });

    expect(apiFetch).toHaveBeenCalledWith('/auth/oauth', {
      method: 'POST',
      body: { idToken: 'id-token', provider: 'google', displayName: undefined },
    });
  });

  it('oauthLogin sets error on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValue(new Error('OAuth failed'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('oauth'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('OAuth failed');
    });
  });

  it('logout clears user, token, and localStorage', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue({
      success: true,
      accessToken: 'jwt-123',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    // Login first
    await user.click(screen.getByTestId('login'));
    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('jwt-123');
    });

    // Then logout
    await user.click(screen.getByTestId('logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(localStorage.getItem('ac-token')).toBeNull();
  });

  it('clearError resets error to null', async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValue(new Error('Some error'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Some error');
    });

    await user.click(screen.getByTestId('clear-error'));
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('fetches user profile on mount when token exists in localStorage', async () => {
    localStorage.setItem('ac-token', 'saved-token');
    vi.mocked(apiFetch).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test Buyer');
    });

    expect(apiFetch).toHaveBeenCalledWith('/auth/me', { token: 'saved-token' });
  });

  it('clears token if profile fetch fails', async () => {
    localStorage.setItem('ac-token', 'expired-token');
    vi.mocked(apiFetch).mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('none');
    });

    expect(localStorage.getItem('ac-token')).toBeNull();
  });

  it('deleteAccount calls API and logs out', async () => {
    const user = userEvent.setup();

    // First login
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        success: true,
        accessToken: 'jwt-del',
        user: mockUser,
      })
      .mockResolvedValueOnce({ success: true }); // delete call

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login'));
    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('jwt-del');
    });

    await user.click(screen.getByTestId('delete'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
      expect(screen.getByTestId('token')).toHaveTextContent('none');
    });

    expect(apiFetch).toHaveBeenCalledWith('/auth/account', { method: 'DELETE', token: 'jwt-del' });
  });

  it('throws when useAuth used outside provider', () => {
    expect(() => {
      render(<AuthConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
