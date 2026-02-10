import { useMemo } from 'react';

export default function useSortableTable(data, sortConfig, customGetters = {}) {

  const getSortedArray = useMemo(() => {
    if (!data) { return [] };
    if (!sortConfig || !sortConfig.key) { return data };

    return [...data].sort((a, b) => {
      const getValue = customGetters[sortConfig.key];
      const aValue = getValue ? getValue(a) : a[sortConfig.key];
      const bValue = getValue ? getValue(b) : b[sortConfig.key];

      if (aValue < bValue) { return sortConfig.direction === 'asc' ? -1 : 1 }
      if (aValue > bValue) { return sortConfig.direction === 'asc' ? 1 : -1 }
      return 0;
    });
  }, [data, sortConfig, customGetters]);

  return getSortedArray;
}