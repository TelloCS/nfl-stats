import { useMemo } from 'react';
import { Loader2, Search } from 'lucide-react';
import { PositionStatMap, FilterConfig } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import FilterSection from '../components/FilterSection';
import ResultsTable from '../components/ResultsTable';

import useUrlTableSort from '../hooks/useUrlTableSort';
import useUrlFilters from '../hooks/useUrlFilters';
import usePositionOpponentData from '../hooks/usePositionOpponentData';

export default function PositionOpponent() {
  const defaults = {
    position: 'QB',
    opponent: 'ARI',
    season_year: FilterConfig.season_year[0].value,
    season_type: FilterConfig.season_type[0].value,
    location: FilterConfig.location[0].value
  };

  const { filters, setFilter } = useUrlFilters(defaults);
  const statsToShow = PositionStatMap[filters.position] || [];

  const {
    flatData,
    stats,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePositionOpponentData(filters);

  const customGetters = useMemo(() => ({
    week: (log) => log.game?.week ?? 0,
  }), []);

  const { sortedItems: sortedGameLogs, handleHeaderClick, sortConfig } = useUrlTableSort(flatData, customGetters);

  return (
    <>
      <UpcomingGames />
      <div className="min-h-[calc(100vh-218px)] bg-background">
        <FilterSection
          filters={filters}
          onFilterChange={setFilter}
          stats={stats}
          isLoading={isLoading}
        />

        <div className="container mx-auto flex flex-col p-4 md:p-8">
          <ResultsTable
            isLoading={isLoading}
            data={sortedGameLogs}
            statsToShow={statsToShow}
            sortConfig={sortConfig}
            onHeaderClick={handleHeaderClick}
          />

          <LoadMoreButton
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </div>
    </>
  );
};

const LoadMoreButton = ({ hasNextPage, isFetchingNextPage, fetchNextPage }) => {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center mt-12 mb-8">
      <button
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
        className="flex items-center gap-3 bg-background border border-geodude-700 text-paper-300 px-8 py-3 rounded-full text-sm font-bold hover:bg-geodude-800 hover:text-foreground hover:border-paper-500 disabled:opacity-50 disabled:shadow-none transition-all duration-200 ease-in-out"
      >
        {isFetchingNextPage ? (
          <>
            <Loader2 className="animate-spin text-primary" size={18} />
            <span>Loading more...</span>
          </>
        ) : (
          <>
            <span>Load More Games</span>
            <Search size={16} className="text-paper-500 group-hover:text-paper-300 transition-colors" />
          </>
        )}
      </button>
    </div>
  );
};