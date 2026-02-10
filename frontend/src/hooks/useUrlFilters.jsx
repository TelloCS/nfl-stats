import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export default function useUrlFilters(initialDefaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const currentFilters = { ...initialDefaults };

    Object.keys(initialDefaults).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue) {
        currentFilters[key] = urlValue;
      }
    });

    return currentFilters;
  }, [searchParams, initialDefaults]);

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) { newParams.set(key, value) }
    else { newParams.delete(key) }

    newParams.delete("sortKey");
    newParams.delete("sortDir");
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return { filters, setFilter, resetFilters };
}