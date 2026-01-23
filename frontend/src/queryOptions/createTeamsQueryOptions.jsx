import { queryOptions } from '@tanstack/react-query'

export default function createTeamsQueryOptions() {
    return queryOptions({
        queryKey: ['teams'],
        queryFn : getTeams
    })
}

const getTeams = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch('/nfl/teams/');
    return response.json();
}