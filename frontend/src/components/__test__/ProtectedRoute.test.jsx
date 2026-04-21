import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('renders the loader when auth is loading', () => {
    useAuth.mockReturnValue({ isLoggedIn: false, isLoading: true });
    
    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );
    
    const loaderContainer = screen.getByRole('custom-loader', { hidden: true }) || document.querySelector('.bg-[#000000]');
    expect(loaderContainer).toBeInTheDocument();
  });

  it('redirects to /login when the user is not authenticated', () => {
    useAuth.mockReturnValue({ isLoggedIn: false, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Settings Page')).not.toBeInTheDocument();
  });

  it('renders child components (Outlet) when the user is authenticated', () => {
    useAuth.mockReturnValue({ isLoggedIn: true, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Settings Page')).toBeInTheDocument();
  });
});