import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";
import { cleanFilters } from "../hooks/useCleanFilters";

export default function createPlayerStatsQueryOptions(player_id, player_slug, filters, version) {
    return queryOptions({
        queryKey: ['playerStats', player_id, player_slug, filters, { v: version }],
        queryFn : () => getPlayerStats(player_id, player_slug, filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getPlayerStats = async (player_id, player_slug, filters) => {
    const cleaned = cleanFilters(filters);
    const params = new URLSearchParams(cleaned).toString();
    const json = await apiFetch(`/nfl/players/${player_id}/${player_slug}/stats${params ? `?${params}` : ''}`)
    return json
}