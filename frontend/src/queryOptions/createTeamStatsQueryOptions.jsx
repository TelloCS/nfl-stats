import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsQueryOptions() {
    return queryOptions({
        queryKey: ['teamStats'],
        queryFn : getTeamStats,
    })
}

const getTeamStats = async () => {
    const json = apiFetch('/nfl/team/stats/');
    return json;
}