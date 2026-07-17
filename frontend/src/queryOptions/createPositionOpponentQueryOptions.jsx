import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createPositionOpponentQueryOptions(position, opponent, seasonYear, seasonType, location, version, allData, isAuth) {
    return infiniteQueryOptions({
        queryKey: ['positionOpponent', position, opponent, seasonYear, seasonType, location, { v: version, all: allData }],
        queryFn: ({ pageParam }) => getPositionOpponent(position, opponent, seasonYear, seasonType, location, pageParam, allData),
        enabled: allData ? !!isAuth : true,
        staleTime: Infinity,
        placeholderData: keepPreviousData,
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

const getPositionOpponent = async (position, opponent, seasonYear, seasonType, location, pageParam, allData) => {
    const params = new URLSearchParams({
        position,
        opponent,
        season_year: seasonYear,
        season_type: seasonType,
        location,
    });
    
    if (allData) {
        params.append('allData', 'true');
    } else {
        params.append('page', pageParam.toString());
    }

    const json = await apiFetch(`/nfl/players/position-vs-opponent?${params.toString()}`);
    return json;
}