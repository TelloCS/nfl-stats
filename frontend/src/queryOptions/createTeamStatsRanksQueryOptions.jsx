import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";
import { cleanFilters } from "../hooks/useCleanFilters";

export default function createTeamStatsRanksQueryOptions(filters, ...args) {
    const version = args.pop();
    const customOptions = args[0] || {};
    return queryOptions({
        queryKey: ['teamStatsRanks', filters, { v: version }],
        queryFn : () => getTeamStatsRanks(filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
        ...customOptions
    })
}

const getTeamStatsRanks = async (filters) => {
    const cleaned = cleanFilters(filters);
    const params = new URLSearchParams(cleaned).toString();
    const json = await apiFetch(`/nfl/team/stats/ranks${params ? `?${params}` : ''}`);
    return json;
}