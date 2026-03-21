import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createUpcomingGamesQueryOptions(version){
    return queryOptions({
        queryKey: ['upcomingGames', { v: version }],
        queryFn : () => getUpcomingGames(),
    })
}

const getUpcomingGames = async () => {
    const json = apiFetch('/nfl/schedule/');
    return json
}