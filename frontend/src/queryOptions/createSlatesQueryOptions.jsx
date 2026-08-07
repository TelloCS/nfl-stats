import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";
import { cleanFilters } from "../hooks/useCleanFilters";

export default function createSlatesQueryOptions(filters, version) {
    return queryOptions({
        queryKey: ['slates', filters, { v: version }],
        queryFn: () => getSlates(filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getSlates = async (filters) => {
    const cleaned = cleanFilters(filters);
    const params = new URLSearchParams(cleaned).toString();
    const json = await apiFetch(`/nfl/slates${params ? `?${params}` : ''}`);
    return json;
}