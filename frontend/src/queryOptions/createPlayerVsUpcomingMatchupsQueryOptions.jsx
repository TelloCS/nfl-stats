import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createPlayerVsUpcomingMatchupsQueryOptions(player_id, player_slug, filters, version) {
    return queryOptions({
        queryKey: ['playerVsUpcomingMatchups', player_id, player_slug, filters, { v: version }],
        queryFn : () => getPlayerVsUpcomingMatchups(player_id, player_slug, filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getPlayerVsUpcomingMatchups = async (player_id, player_slug, filters) => {
    const params = new URLSearchParams(filters).toString();     
    const json = await apiFetch(`/nfl/player/stats/id/${player_id}/${player_slug}/vs-upcoming-matchup${params ? `?${params}` : ''}`)
    return json
}