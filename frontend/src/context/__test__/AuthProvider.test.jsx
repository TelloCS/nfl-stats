import { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../AuthProvider';
import { AuthContext } from '../AuthContext';
import { useUser } from '../../hooks/useUser';
import * as authApi from '../../api/authentication';

vi.mock('../../hooks/useUser');
vi.mock('../../api/authentication');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

const TestConsumer = () => {
  const { 
    user, 
    isLoggedIn, 
    isLoading, 
    loginMutation, 
    registerMutation, 
    logoutMutation, 
    deleteMutation 
  } = useContext(AuthContext);

  if (isLoading) return <div role="loading-state">Loading...</div>;

  return (
    <div>
      <div role="auth-status">{isLoggedIn ? 'Authenticated' : 'Anonymous'}</div>
      <div role="username">{user?.username || 'No User'}</div>
      
      <button onClick={() => loginMutation.mutate({ email: 'test@test.com' })}>Login</button>
      <button onClick={() => registerMutation.mutate({ email: 'new@test.com' })}>Register</button>
      <button onClick={() => logoutMutation.mutate()}>Logout</button>
      <button onClick={() => deleteMutation.mutate()}>Delete</button>
    </div>
  );
};

describe('AuthProvider Comprehensive Suite', () => {
  let queryClient
  let consoleErrorSpy;
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    queryClient = new QueryClient({
      defaultOptions: { 
        queries: { retry: false },
        mutations: { retry: false } 
      },
    });

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // --- 1. STATE & RENDERING TESTS ---
  it('provides a loading state while fetching user data', () => {
    vi.mocked(useUser).mockReturnValue({ data: null, isLoading: true });
    renderWithProviders();
    
    expect(screen.getByRole('loading-state')).toBeInTheDocument();
  });

  it('identifies the user as logged in when data is returned', () => {
    vi.mocked(useUser).mockReturnValue({ 
      data: { username: 'test_user' }, 
      isLoading: false 
    });
    renderWithProviders();

    expect(screen.getByRole('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByRole('username')).toHaveTextContent('test_user');
  });

  // --- 2. MUTATION TESTS ---
  it('loginMutation: invalidates userProfile query on success', async () => {
    vi.mocked(useUser).mockReturnValue({ data: null, isLoading: false });
    vi.mocked(authApi.login).mockResolvedValue({});
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@test.com' }),
        expect.anything()
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['userProfile'] });
    });
  });

  it('registerMutation: navigates to login with a success message', async () => {
    vi.mocked(useUser).mockReturnValue({ data: null, isLoading: false });
    vi.mocked(authApi.register).mockResolvedValue({});

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com' }),
        expect.anything()
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login', { 
        state: { message: "Account created. Redirecting..." } 
      });
    });
  });

  it('logoutMutation: clears cache and navigates to login', async () => {
    vi.mocked(useUser).mockReturnValue({ data: { username: 'user' }, isLoading: false });
    vi.mocked(authApi.logout).mockResolvedValue({});
    const clearSpy = vi.spyOn(queryClient, 'clear');

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deleteMutation: clears cache and navigates to home on success', async () => {
    vi.mocked(useUser).mockReturnValue({ data: { username: 'user' }, isLoading: false });
    vi.mocked(authApi.deleteAccount).mockResolvedValue({});
    const clearSpy = vi.spyOn(queryClient, 'clear');

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(authApi.deleteAccount).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('deleteMutation: clears cache and navigates to home on 403/404 error', async () => {
    vi.mocked(useUser).mockReturnValue({ data: { username: 'user' }, isLoading: false });
    vi.mocked(authApi.deleteAccount).mockRejectedValue({ response: { status: 403 } });
    const clearSpy = vi.spyOn(queryClient, 'clear');

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('deleteMutation: logs generic errors without navigating', async () => {
    vi.mocked(useUser).mockReturnValue({ data: { username: 'user' }, isLoading: false });
    const errorResponse = { response: { status: 500 } };
    vi.mocked(authApi.deleteAccount).mockRejectedValue(errorResponse);
    
    const clearSpy = vi.spyOn(queryClient, 'clear');

    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Deleting Account failed:", errorResponse);
      expect(clearSpy).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});