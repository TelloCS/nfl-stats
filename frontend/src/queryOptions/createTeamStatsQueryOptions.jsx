import { queryOptions } from '@tanstack/react-query'

export default function createTeamStatsQueryOptions() {
    return queryOptions({
        queryKey: ['teamStats'],
        queryFn : getTeamStats,
        retry: false
    })
}

const getTeamStats = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch('/nfl/team/stats/');
    return response.json();
}