import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CustomLoader from './CustomLoader';

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className='flex flex-col min-h-screen justify-center bg-[#000000]'>
        <CustomLoader
          color={"text-white"}
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