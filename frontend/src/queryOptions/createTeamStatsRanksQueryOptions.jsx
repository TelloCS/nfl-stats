import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsRanksQueryOptions() {
    return queryOptions({
        queryKey: ['teamStatsRanks'],
        queryFn : getTeamStatsRanks,
    })
}

const getTeamStatsRanks = async () => {
    const json = apiFetch('/nfl/team/stats/ranks/');
    return json;
}