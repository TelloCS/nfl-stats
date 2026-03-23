import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export default function createPlayerSearchQueryOptions(input, version) {
    return queryOptions({
        queryKey: ["playerSearch", input, { v: version }],
        queryFn : () => getPlayerSearchResults(input),
        enabled : !!input && input.length >= 3,
        staleTime: 1000 * 60 * 10,
        retry: true,
    })
}

const getPlayerSearchResults = async (input) => {
    const json = await apiFetch(`/nfl/players/?fullName=${input}`);
    return json?.players || json?.results || json || [];
}