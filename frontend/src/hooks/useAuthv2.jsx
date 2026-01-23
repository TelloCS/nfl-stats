import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// baseURL is set to '/' because vite.config.js proxies /auth requests
const api = axios.create({
  baseURL: '/',
  withCredentials: true,
});

/**
 * Axios Interceptor: Attaches the Django CSRF token to non-safe requests.
 * This is critical for POST, PUT, and DELETE operations.
 */
api.interceptors.request.use((config) => {
  const name = 'csrftoken';
  let csrfToken = null;
  
  // Standard logic to extract CSRF token from browser cookies
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        csrfToken = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Fetch the current user status
  const userQuery = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        // Proxied to http://backend:8000/auth/user/me/
        const { data } = await api.get('/auth/user/me/');
        return data;
      } catch (err) {
        // 401/403 means the user is not logged in
        if (err.response?.status === 401 || err.response?.status === 403) {
          return null;
        }
        // Throw 500 or network errors so React Query knows the server is down
        throw err;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a simple 401 (not logged in)
      if (error.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Cache user info for 5 minutes
  });
  
  // Handle Logout
  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout/'),
    onSuccess: () => {
      // Clear the cache and redirect to the Django login page
      queryClient.clear();
      window.location.href = '/auth/login/';
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    logout: logoutMutation.mutate,
    isAuthenticated: !!userQuery.data,
  };
};