import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamsQueryOptions(version) {
    return queryOptions({
        queryKey: ['teams', { v: version }],
        queryFn : getTeams,
    })
}

const getTeams = async () => {
    const json = apiFetch('/nfl/teams/');
    return json;
}