import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export default function useUrlTableSort(data, customGetters = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortKey = searchParams.get("sortKey");
  const sortDir = searchParams.get("sortDir");

  const sortConfig = useMemo(() => {
    return sortKey ? { key: sortKey, direction: sortDir } : null;
  }, [sortKey, sortDir]);

  const sortedItems = useMemo(() => {
    if (!data) return [];

    if (!sortConfig || !sortConfig.key) return [...data];

    return [...data].sort((a, b) => {
      const getValue = customGetters[sortConfig.key];

      const aValue = getValue ? getValue(a) : a[sortConfig.key];
      const bValue = getValue ? getValue(b) : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, customGetters]);

  const handleHeaderClick = useCallback((key) => {
    let newDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("sortKey", key);
      newParams.set("sortDir", newDirection);
      return newParams;
    }, { replace: true });
  }, [sortConfig, setSearchParams]);

  return { sortedItems, handleHeaderClick, sortConfig };
}