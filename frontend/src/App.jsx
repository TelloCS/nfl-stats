import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicRoute from "./components/PublicRoute";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import PositionOpponent from './pages/PositionOpponent';
import TeamStats from './pages/TeamStats';
import PlayerDashboard from './pages/PlayerDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import ErrorPage from './pages/ErrorPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/signup',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ]
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/player/stats/id/:player_id/:player_slug',
        element: <PlayerDashboard />
      },
      {
        path: '/position-vs-opponent/',
        element: <PositionOpponent />
      },
      {
        path: '/team/stats/',
        element: <TeamStats />
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