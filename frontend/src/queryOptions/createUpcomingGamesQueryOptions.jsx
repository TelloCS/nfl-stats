import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createUpcomingGamesQueryOptions(){
    return queryOptions({
        queryKey: ['upcomingGames'],
        queryFn : () => getUpcomingGames(),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
        meta: {
            persist: false,
        }
    })
}

const getUpcomingGames = async () => {
    const json = await apiFetch('/nfl/schedule/');
    return json
}