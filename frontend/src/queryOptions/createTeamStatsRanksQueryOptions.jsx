import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsRanksQueryOptions(filters, version) {
    return queryOptions({
        queryKey: ['teamStatsRanks', filters, { v: version }],
        queryFn : () => getTeamStatsRanks(filters),
        staleTime: Infinity,
    })
}

const getTeamStatsRanks = async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const json = await apiFetch(`/nfl/team/stats/ranks${params ? `?${params}` : ''}`);
    return json;
}