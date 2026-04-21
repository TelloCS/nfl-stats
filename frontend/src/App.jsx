import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthProvider';
import PublicRoute from "./components/PublicRoute";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import PositionOpponent from './pages/PositionOpponent';
import TeamStats from './pages/TeamStats';
import PlayerDashboard from './pages/PlayerDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import ErrorPage from './pages/ErrorPage';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <PublicRoute />,
        errorElement: <ErrorPage />,
        children: [
          { path: '/signup', element: <Register /> },
          { path: '/login', element: <Login /> },
          { path: '/forgot-password', element: <PasswordResetRequest />},
          { path: '/password-reset-confirm/:uid/:token', element: <PasswordResetConfirm />}
        ]
      },
      {
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '/settings',
            element: <Layout />,
            children: [{ index: true, element: <UserProfile /> }]
          }
        ]
      },
      {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home /> },
          { path: '/player/stats/id/:player_id/:player_slug', element: <PlayerDashboard /> },
          { path: '/position-vs-opponent/', element: <PositionOpponent /> },
          { path: '/team/stats/', element: <TeamStats /> },
        ]
      }
    ]
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;