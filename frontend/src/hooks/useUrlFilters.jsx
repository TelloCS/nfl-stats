import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export const sortParams = (params) => {
  const ORDER = ["season_year", "tab"];
  const newParams = new URLSearchParams();

  ORDER.forEach((key) => {
    if (params.has(key)) {
      newParams.set(key, params.get(key));
    }
  });

  params.forEach((value, key) => {
    if (!ORDER.includes(key)) {
      newParams.set(key, value);
    }
  });

  return newParams;
};

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

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    newParams.delete("sortKey");
    newParams.delete("sortDir");

    setSearchParams(sortParams(newParams));
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return { filters, setFilter, resetFilters };
}