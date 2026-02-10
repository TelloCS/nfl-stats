import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import createPositionOpponentQueryOptions from "../queryOptions/createPositionOpponentQueryOptions";

export default function usePositionOpponentData(filters) {
  const query = useInfiniteQuery(
    createPositionOpponentQueryOptions(
      filters.position,
      filters.opponent,
      filters.season_year,
      filters.season_type,
      filters.location
    )
  );

  const { data } = query;

  const flatData = useMemo(() => {
    return data?.pages?.flatMap(page => page.results) || [];
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.pages?.length) return { totalCount: 0, totalPages: 0, loadedCount: 0 };

    const firstPage = data.pages[0];
    const totalCount = firstPage.count || 0;
    
    const pageSize = firstPage.results?.length > 0 ? firstPage.results.length : 50;
    
    return { 
      totalCount, 
      totalPages: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      loadedCount: flatData.length
    };
  }, [data, flatData.length]);

  return {
    ...query,
    flatData,
    stats
  };
}