import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createPlayerCareerFantasyRankingsQueryOptions(player_id, player_slug, version) {
    return queryOptions({
        queryKey: ['playerCareerFantasyRankings', player_id, player_slug, { v: version }],
        queryFn : () => getPlayerCareerFantasyRankings(player_id, player_slug),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getPlayerCareerFantasyRankings = async (player_id, player_slug) => {
    const json = await apiFetch(`/nfl/players/${player_id}/${player_slug}/career`)
    return json
}