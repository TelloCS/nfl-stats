import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CustomLoader from './CustomLoader';

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className='flex flex-col min-h-screen justify-center bg-background'>
        <CustomLoader
          color={"text-foreground"}
          size={36}
        />
      </div>
    )

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;