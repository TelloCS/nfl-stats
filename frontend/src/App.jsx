import './App.css';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import { QueryClient, QueryClientProvider, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './theme';
import PublicRoute from "./components/PublicRoute";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import PositionOpponent from './components/PositionOpponent';
import Team from './components/Team/Team';
import TeamStats from './pages/TeamStats';
import PlayerDashboard from './pages/PlayerDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import ErrorPage from './pages/ErrorPage';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import FantasyRankings from './components/FantasyRankings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: Infinity,
      retry: 1,
      retryDelay: (attempt) => Math.min(attempt * 1000, 5000),
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
      refetchOnReconnect: true,
    },
  },
});

const sessionStoragePersister = createSyncStoragePersister({
  storage: window.sessionStorage,
});

persistQueryClient({
  queryClient,
  persister: sessionStoragePersister,
  dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
            if (query.meta?.persist === false) {
                return false;
            }
            return defaultShouldDehydrateQuery(query);
        },
    },
});

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
        <ScrollRestoration />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
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
          { path: '/players/:player_id/:player_slug/stats', element: <PlayerDashboard /> },
          { path: '/position-vs-opponent/', element: <PositionOpponent /> },
          { path: '/fantasy-rankings', element: <FantasyRankings />},
          { path: '/team/stats/', element: <TeamStats /> },
          { path: '/teams/:team_slug', element: <Team />},
          { path: '*', element: <ErrorPage /> }
        ]
      }
    ]
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> 
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;