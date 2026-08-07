import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createTeamRanksQueryOptions(slug, version) {
    return queryOptions({
        queryKey: ['teamRanks', slug, { v: version }],
        queryFn : () => getTeamRanks(slug),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getTeamRanks = async (slug) => {
    const json = await apiFetch(`/nfl/teams/${slug}/ranks/`)
    return json;
}