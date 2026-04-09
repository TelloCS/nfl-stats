import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const ProtectedRoute = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;