import { queryOptions } from '@tanstack/react-query'

export default function createPositionOpponentQueryOptions(position, opponent) {
    return queryOptions({
        queryKey: ['positionOpponent', position, opponent],
        queryFn : () => getPositionOpponent(position, opponent)
    })
}

const getPositionOpponent = async (position, opponent) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`/nfl/player/stats/gamelogs/?position=${position}&opponent=${opponent}`);
    return response.json()
}