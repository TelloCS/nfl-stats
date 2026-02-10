import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../actions/authentication';

export const useUser = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};