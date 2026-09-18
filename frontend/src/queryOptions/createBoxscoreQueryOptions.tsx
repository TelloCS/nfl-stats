import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export interface Boxscore {
    id: number,
    date: string;
    name: string;
    short_name: string;
    season_year: number;
    season_type: number;
    week: number;
    status: string;
    homeTeam: Team;
    awayTeam: Team;
    home_score: number;
    away_score: number;
}

interface Team {
    id: number;
    slug: string;
    full_name: string;
    nickname: string;
    abbreviation: string;
    conference: string;
    division: string;
    players: PlayerStats[];
}

export interface PlayerStats {
    player: Player,
    pass_attempts: number;
}

interface Player {
    id: number;
    fullName: string;
    position: string;
    slug: string;
}



export default function createBoxscoreQueryOptions(game_id: string, version: number) {
    return queryOptions({
        queryKey: ['boxscore', game_id, { v: version }],
        queryFn: () => getBoxscore(game_id),
        staleTime: Infinity,
        placeholderData: keepPreviousData
    })
}

const getBoxscore = async (game_id: string): Promise<Boxscore> => {
    const json = await apiFetch(`/nfl/games/${game_id}/boxscore`)
    return json
}