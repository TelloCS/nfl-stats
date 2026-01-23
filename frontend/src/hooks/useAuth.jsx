import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const metaElement = document.querySelector('meta[name="csrf-token"]');
  let csrfToken = metaElement ? metaElement.getAttribute('content') : null;

  if (!csrfToken) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) csrfToken = parts.pop().split(';').shift();
  }

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

export const useAuth = () => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/user/me');
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  
  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout/'),
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      window.location.href = '/auth/login/';
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    logout: logoutMutation.mutate,
    isAuthenticated: !!userQuery.data,
  };
};