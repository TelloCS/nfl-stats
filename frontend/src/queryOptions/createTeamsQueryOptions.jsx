import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamsQueryOptions() {
    return queryOptions({
        queryKey: ['teams'],
        queryFn : getTeams,
    })
}

const getTeams = async () => {
    const json = apiFetch('/nfl/teams/');
    return json;
}