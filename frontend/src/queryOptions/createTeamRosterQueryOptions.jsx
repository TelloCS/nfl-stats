import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createTeamRosterQueryOptions(slug, version) {
    return queryOptions({
        queryKey: ['teamRoster', slug, { v: version }],
        queryFn : () => getTeamRoster(slug),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getTeamRoster = async (slug) => {
    const json = await apiFetch(`/nfl/teams/${slug}/roster/`)
    return json;
}