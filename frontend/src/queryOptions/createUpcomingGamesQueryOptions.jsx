import { queryOptions } from "@tanstack/react-query";

export default function createUpcomingGamesQueryOptions(){
    return queryOptions({
        queryKey: ['upcomingGames'],
        queryFn : () => getUpcomingGames(),
        retry: false,
        refetchOnWindowFocus: false
    })
}

const getUpcomingGames = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch('/nfl/schedule/');
    return response.json()
}