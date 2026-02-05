import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicRoute from "./components/PublicRoute";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import PositionOpponent from './pages/PositionOpponent';
import TeamStats from './pages/TeamStats';
import PlayerStats from './pages/PlayerStats';
import Register from './pages/Register';
import Login from './pages/Login';
import GenericErrorPage from './pages/GenericErrorPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        errorElement: <GenericErrorPage />,
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
        errorElement: <GenericErrorPage />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/player/stats/id/:player_id/:player_slug/',
                element: <PlayerStats />
            },
            {
                path: '/team/stats/id/:team_id/:team_slug/',
                element: <Team />
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