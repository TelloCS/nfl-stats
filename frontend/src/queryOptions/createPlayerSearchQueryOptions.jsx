import { queryOptions } from "@tanstack/react-query";

export default function createPlayerSearchQueryOptions(input) {
    return queryOptions({
        queryKey: ["playerSearch", input],
        queryFn : () => getPlayerSearchResults(input),
        enabled : !!input && input.length >= 2,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false
    })
}

const getPlayerSearchResults = async (input) => {
    const response = await fetch("/nfl/players/?fullName=" + input);
    
    if (!response.ok) {
        throw new Error("Failed to fetch players");
    }

    const json = await response.json();
    return json?.players || json?.results || json || [];
}