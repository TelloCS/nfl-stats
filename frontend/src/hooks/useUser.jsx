import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/authentication';

export const useUser = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
    retry: false,
  });
};