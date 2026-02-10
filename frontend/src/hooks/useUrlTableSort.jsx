import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import useSortableTable from "./useSortableTable"; 

export default function useUrlTableSort(data, customGetters = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortKey = searchParams.get("sortKey");
  const sortDir = searchParams.get("sortDir");
  const sortConfig = sortKey ? { key: sortKey, direction: sortDir } : null;

  const sortedItems = useSortableTable(data, sortConfig, customGetters);

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