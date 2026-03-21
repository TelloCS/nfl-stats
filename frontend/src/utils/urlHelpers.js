export function buildSafeQueryString(paramsObj) {
    if (!paramsObj) return '';

    const cleanParams = Object.fromEntries(
        Object.entries(paramsObj).filter(([_, value]) => 
            value !== null && 
            value !== undefined && 
            value !== ''
        )
    );

    const queryString = new URLSearchParams(cleanParams).toString();
    return queryString ? `?${queryString}` : '';
}