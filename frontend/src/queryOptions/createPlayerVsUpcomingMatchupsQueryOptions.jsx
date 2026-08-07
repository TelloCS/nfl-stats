import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";
import { cleanFilters } from "../hooks/useCleanFilters";

export default function createPlayerVsUpcomingMatchupsQueryOptions(player_id, player_slug, filters, version) {
    return queryOptions({
        queryKey: ['playerVsUpcomingMatchups', player_id, player_slug, filters, { v: version }],
        queryFn : () => getPlayerVsUpcomingMatchups(player_id, player_slug, filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getPlayerVsUpcomingMatchups = async (player_id, player_slug, filters) => {
    const cleaned = cleanFilters(filters);
    const params = new URLSearchParams(cleaned).toString();     
    const json = await apiFetch(`/nfl/players/${player_id}/${player_slug}/upcoming-matchup${params ? `?${params}` : ''}`)
    return json
}