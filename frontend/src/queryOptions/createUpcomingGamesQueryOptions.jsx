import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createUpcomingGamesQueryOptions(version){
    return queryOptions({
        queryKey: ['upcomingGames', { v: version }],
        queryFn : () => getUpcomingGames(),
        staleTime: Infinity,
    })
}

const getUpcomingGames = async () => {
    const json = await apiFetch('/nfl/schedule/');
    return json
}