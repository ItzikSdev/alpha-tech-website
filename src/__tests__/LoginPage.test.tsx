import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock contexts
const mockLogin = vi.fn();
const mockOauthLogin = vi.fn();
const mockClearError = vi.fn();
const mockNavigate = vi.fn();

let mockAuthReturn = {
  login: mockLogin,
  oauthLogin: mockOauthLogin,
  loading: false,
  error: null as string | null,
  clearError: mockClearError,
  token: null as string | null,
  user: null,
  logout: vi.fn(),
  deleteAccount: vi.fn(),
};

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    lang: 'en',
    t: (key: string) => {
      const map: Record<string, string> = {
        'page.backHome': 'Back to Home',
        'login.title': 'Sign In',
        'login.subtitle': 'Welcome back',
        'login.email': 'Email',
        'login.emailPlaceholder': 'Enter email',
        'login.password': 'Password',
        'login.passwordPlaceholder': 'Enter password',
        'login.submit': 'Sign In',
        'login.loading': 'Signing in...',
        'login.or': 'or',
        'login.google': 'Continue with Google',
        'login.apple': 'Continue with Apple',
        'login.noAccount': "Don't have an account?",
        'login.downloadApp': 'Download the app',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthReturn,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturn = {
      login: mockLogin,
      oauthLogin: mockOauthLogin,
      loading: false,
      error: null,
      clearError: mockClearError,
      token: null,
      user: null,
      logout: vi.fn(),
      deleteAccount: vi.fn(),
    };
    // Reset Google/Apple globals
    (window as Record<string, unknown>).google = undefined;
    (window as Record<string, unknown>).AppleID = undefined;
  });

  it('renders login form with all fields', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('renders email input with correct type and dir=ltr', () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('Enter email');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('dir', 'ltr');
  });

  it('renders password input with type password by default', () => {
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText('Enter password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByPlaceholderText('Enter password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.parentElement?.querySelector('button');
    expect(toggleBtn).toBeTruthy();

    await user.click(toggleBtn!);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleBtn!);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits login form with email and password', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderLoginPage();

    await user.type(screen.getByPlaceholderText('Enter email'), 'test-buyer@alphacar.com');
    await user.type(screen.getByPlaceholderText('Enter password'), 'Test1234x');

    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitBtn);

    expect(mockClearError).toHaveBeenCalled();
    expect(mockLogin).toHaveBeenCalledWith('test-buyer@alphacar.com', 'Test1234x');
  });

  it('navigates to settings after successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderLoginPage();

    await user.type(screen.getByPlaceholderText('Enter email'), 'test-buyer@alphacar.com');
    await user.type(screen.getByPlaceholderText('Enter password'), 'Test1234x');

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  it('does not navigate when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid'));

    renderLoginPage();

    await user.type(screen.getByPlaceholderText('Enter email'), 'test-buyer@alphacar.com');
    await user.type(screen.getByPlaceholderText('Enter password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith('/settings');
  });

  it('renders back to home link', () => {
    renderLoginPage();

    const backLink = screen.getByText(/Back to Home/);
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders divider with "or" text', () => {
    renderLoginPage();

    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('renders footer text', () => {
    renderLoginPage();

    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
    expect(screen.getByText('Download the app')).toBeInTheDocument();
  });

  it('shows loading text and disables button when loading', () => {
    mockAuthReturn = { ...mockAuthReturn, loading: true };

    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: 'Signing in...' });
    expect(submitBtn).toBeDisabled();
  });

  it('renders error message when error exists', () => {
    mockAuthReturn = { ...mockAuthReturn, error: 'Invalid credentials' };

    renderLoginPage();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('does not render error when no error', () => {
    renderLoginPage();

    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });
});
