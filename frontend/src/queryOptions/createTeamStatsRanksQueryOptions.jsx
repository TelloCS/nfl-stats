import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createTeamStatsRanksQueryOptions(version) {
    return queryOptions({
        queryKey: ['teamStatsRanks', { v: version }],
        queryFn : getTeamStatsRanks,
    })
}

const getTeamStatsRanks = async () => {
    const json = apiFetch('/nfl/team/stats/ranks/');
    return json;
}