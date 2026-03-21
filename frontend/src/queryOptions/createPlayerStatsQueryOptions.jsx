import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createPlayerStatsQueryOptions(player_id, player_slug, filters, version) {
    return queryOptions({
        queryKey: ['playerStats', player_id, player_slug, filters, { v: version }],
        queryFn : () => getPlayerStats(player_id, player_slug, filters),
        staleTime: Infinity,
    })
}

const getPlayerStats = async (player_id, player_slug, filters) => {
    const params = new URLSearchParams(filters).toString();     
    const json = apiFetch(`/nfl/player/stats/id/${player_id}/${player_slug}${params ? `?${params}` : ''}`)
    return json
}