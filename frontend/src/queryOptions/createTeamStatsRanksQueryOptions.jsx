import { queryOptions } from '@tanstack/react-query'

export default function createTeamStatsRanksQueryOptions() {
    return queryOptions({
        queryKey: ['teamStatsRanks'],
        queryFn : getTeamStatsRanks,
        retry: false,
        refetchOnWindowFocus: false
    })
}

const getTeamStatsRanks = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch('/nfl/team/stats/ranks/');
    return response.json();
}