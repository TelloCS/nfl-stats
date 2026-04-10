import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import CustomLoader from './CustomLoader';

const ProtectedRoute = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading)
    return (
      <div className='flex flex-col min-h-screen justify-center bg-[#000000]'>
        <CustomLoader
          color={"text-white"}
          size={36}
        />
      </div>
    )

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;