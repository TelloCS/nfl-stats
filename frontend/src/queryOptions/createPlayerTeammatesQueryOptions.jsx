import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";
import { cleanFilters } from "../hooks/useCleanFilters";

export default function createPlayerTeammatesQueryOptions(filters, version) {
    return queryOptions({
        queryKey: ['playerTeammates', filters, { v: version }],
        queryFn : () => getPlayerTeammates(filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getPlayerTeammates = async (filters) => {
    const cleaned = cleanFilters(filters);
    const params = new URLSearchParams(cleaned).toString();
    const json = await apiFetch(`/nfl/players/teammates${params ? `?${params}` : ''}`)
    return json;
}