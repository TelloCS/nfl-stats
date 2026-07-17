import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from "../utils/apiFetch";

export default function createSlatesQueryOptions(filters, version) {
    return queryOptions({
        queryKey: ['slates', filters, { v: version }],
        queryFn: () => getSlates(filters),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

const getSlates = async (filters) => {
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

    const params = new URLSearchParams(cleanFilters).toString();
    const json = await apiFetch(`/nfl/slates${params ? `?${params}` : ''}`);
    return json;
}