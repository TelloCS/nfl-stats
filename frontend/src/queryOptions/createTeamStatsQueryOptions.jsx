import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsQueryOptions(version) {
    return queryOptions({
        queryKey: ['teamStats', { v: version }],
        queryFn : getTeamStats,
    })
}

const getTeamStats = async () => {
    const json = apiFetch('/nfl/team/stats/');
    return json;
}