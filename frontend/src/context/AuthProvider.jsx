import { AuthContext } from "./AuthContext";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, logout, deleteAccount } from "../api/authentication";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useUser();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/login', { state: { message: "Account created. Redirecting..." } });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error)
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      navigate('/', { replace: true });
    },
    onError: (error) => {
      if (error.response?.status === 403 || error.response?.status === 404) {
        queryClient.clear();
        navigate('/', { replace: true });
        return;
      }

      console.error("Deleting Account failed:", error);
    }
  });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      loginMutation,
      registerMutation,
      logoutMutation,
      deleteMutation
    }}>
      {children} 
    </AuthContext.Provider>
  )
};