import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamsQueryOptions(version) {
    return queryOptions({
        queryKey: ['teams', { v: version }],
        queryFn : getTeams,
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getTeams = async () => {
    const json = await apiFetch('/nfl/teams/');
    return json;
}