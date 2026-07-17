import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export const sortParams = (params) => {
  const ORDER = ["season_year", "tab"];
  const newParams = new URLSearchParams();

  ORDER.forEach((key) => {
    const value = params.get(key);

    if (value) {
      newParams.set(key, value);
    }
  });

  params.forEach((value, key) => {
    if (!ORDER.includes(key) && value) {
      newParams.set(key, value);
    }
  });

  return newParams;
};

export default function useUrlFilters(initialDefaults) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultsString = JSON.stringify(initialDefaults);

  const filters = useMemo(() => {
    const defaults = JSON.parse(defaultsString);
    const currentFilters = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue) {
        currentFilters[key] = urlValue;
      }
    });

    return currentFilters;
  }, [searchParams, defaultsString]);

  const setFilter = useCallback((key, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);

      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }

      newParams.delete("sortKey");
      newParams.delete("sortDir");

      return sortParams(newParams);
    });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return { filters, setFilter, resetFilters };
}