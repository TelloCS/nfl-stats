import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'

export default function createPositionOpponentQueryOptions(position, opponent, seasonYear, seasonType, location) {
    return queryOptions({
        queryKey: ['positionOpponent', position, opponent, seasonYear, seasonType, location],
        queryFn : () => getPositionOpponent(position, opponent, seasonYear, seasonType, location),
        retry: false
    })
}

const getPositionOpponent = async (position, opponent, seasonYear, seasonType, location) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`/nfl/player/stats/gamelogs?position=${position}&opponent=${opponent}&season_year=${seasonYear}&season_type=${seasonType}&location=${location}`);
    return response.json()
}