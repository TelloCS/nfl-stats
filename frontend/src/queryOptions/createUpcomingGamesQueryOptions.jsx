import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createUpcomingGamesQueryOptions(){
    return queryOptions({
        queryKey: ['upcomingGames'],
        queryFn : () => getUpcomingGames(),
    })
}

const getUpcomingGames = async () => {
    const json = apiFetch('/nfl/schedule/');
    return json
}