import { queryOptions } from "@tanstack/react-query";

export default function createPlayerStatsQueryOptions(player_id, player_slug) {
    return queryOptions({
        queryKey: ['playerStats', player_id, player_slug],
        queryFn : () => getPlayerStats(player_id, player_slug),
        staleTime: Infinity,
        retry: false
    })
}

const getPlayerStats = async (player_id, player_slug) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`/nfl/player/stats/id/${player_id}/${player_slug}`);
    return response.json()
}