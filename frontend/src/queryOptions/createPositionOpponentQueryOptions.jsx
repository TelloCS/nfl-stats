import { infiniteQueryOptions } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createPositionOpponentQueryOptions(position, opponent, seasonYear, seasonType, location, version) {
    return infiniteQueryOptions({
        queryKey: ['positionOpponent', position, opponent, seasonYear, seasonType, location, { v: version }],
        queryFn: ({ pageParam }) => getPositionOpponent(position, opponent, seasonYear, seasonType, location, pageParam),
        staleTime: Infinity,
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

    const json = await apiFetch(`/nfl/player/stats/gamelogs?${params.toString()}`);
    return json;
}