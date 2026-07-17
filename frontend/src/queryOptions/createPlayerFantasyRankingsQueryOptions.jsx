import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createPlayerFantasyRankingsQueryOptions(position, team, seasonYear, seasonType, scoringFormat, version) {
    return infiniteQueryOptions({
        queryKey: ['fantasyRankings', position, team, seasonYear, seasonType, scoringFormat, { v: version }],
        queryFn: ({ pageParam }) => getFantasyRankings(position, team, seasonYear, seasonType, scoringFormat, pageParam),
        enabled: true,
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

const getFantasyRankings = async (position, team, seasonYear, seasonType, scoringFormat, pageParam) => {
    const params = new URLSearchParams({
        position,
        team,
        season_year: seasonYear,
        season_type: seasonType,
        ordering: scoringFormat === 'ppr_points' ? 'rank_ppr' : `rank_${scoringFormat.replace('_points', '')}`
    });

    if (pageParam) {
        params.append('page', pageParam);
    }

    const json = await apiFetch(`/nfl/players/fantasy-rankings?${params.toString()}`);
    return json;
}