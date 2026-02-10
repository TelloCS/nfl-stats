import { infiniteQueryOptions } from '@tanstack/react-query'

export default function createPositionOpponentQueryOptions(position, opponent, seasonYear, seasonType, location) {
    return infiniteQueryOptions({
        queryKey: ['positionOpponent', position, opponent, seasonYear, seasonType, location],
        queryFn: ({ pageParam }) => getPositionOpponent(position, opponent, seasonYear, seasonType, location, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    return url.searchParams.get('page');
                } catch {
                    return undefined;
                }
            }
            return undefined;
        },
        retry: false
    })
}

const getPositionOpponent = async (position, opponent, seasonYear, seasonType, location, pageParam) => {
    const params = new URLSearchParams({
        position,
        opponent,
        season_year: seasonYear,
        season_type: seasonType,
        location,
        page: pageParam.toString()
    });

    const response = await fetch(`/nfl/player/stats/gamelogs?${params.toString()}`);
    return response.json();
}