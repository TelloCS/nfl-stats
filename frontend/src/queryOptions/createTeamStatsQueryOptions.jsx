import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsQueryOptions(filters, version) {
    return queryOptions({
        queryKey: ['teamStats', filters, { v: version }],
        queryFn : () => getTeamStats(filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getTeamStats = async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const json = await apiFetch(`/nfl/team/stats${params ? `?${params}` : ''}`);
    return json;
}