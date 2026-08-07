import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createTeamQueryOptions(slug, version) {
    return queryOptions({
        queryKey: ['team', slug, { v: version }],
        queryFn : () => getTeam(slug),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getTeam = async (slug) => {
    const json = await apiFetch(`/nfl/teams/${slug}`)
    return json;
}