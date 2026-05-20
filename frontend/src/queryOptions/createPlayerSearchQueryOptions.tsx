import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export interface Player {
    id: number;
    fullName: string;
    slug: string;
    team: {
        full_name: string;
    }
}

export function createPlayerSearchQueryOptions(input: string, version: number) {
    return queryOptions({
        queryKey: ["playerSearch", input, { v: version }] as const,
        queryFn: () => getPlayerSearchResults(input),
        enabled: !!input && input.length >= 3,
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    });
}

const getPlayerSearchResults = async (input: string): Promise<Player[]> => {
    const json = await apiFetch(`/nfl/players/?fullName=${input}`);
    return json?.players || [];
}