import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Player from './pages/Player';
import Team from './pages/Team';
import PosVsOpp from './pages/PosVsOpp'
import TeamStats from './pages/TeamStats'
import PlayerStats from './components/PlayerStats'

const queryClient = new QueryClient({

})

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/player/stats/id/:player_id/:player_slug/',
                element:<Player />
            },
            {
                path: '/team/stats/id/:team_id/:team_slug/',
                element: <Team />
            },
            {
                path: '/position-vs-opponent/',
                element: <PosVsOpp />
            },
            {
                path: '/team/stats/',
                element: <TeamStats />
            }
        ]
    }
])

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    )
}

export default App