import { queryOptions } from "@tanstack/react-query";

export default function createUpcomingGamesQueryOptions(week, status){
    return queryOptions({
        queryKey: ['upcomingGames', week, status],
        queryFn : () => getUpcomingGames(week, status),
    })
}

const getUpcomingGames = async (week, status) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`/nfl/events/?week=18&status=Final`);
    return response.json()
}