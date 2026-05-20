import { useState, useMemo, useEffect } from 'react';
import { Loader2, Search, Lock } from 'lucide-react';
import { PositionStatMap, FilterConfig } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import FilterSection from '../components/FilterSection';
import ResultsTable from '../components/ResultsTable';

import useUrlTableSort from '../hooks/useUrlTableSort';
import useUrlFilters from '../hooks/useUrlFilters';
import usePositionOpponentData from '../hooks/usePositionOpponentData';
import PvOChart from '../components/PositionOpponentChart';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PositionOpponent() {
  const { user } = useAuth();

  const defaults = {
    position: 'QB',
    opponent: 'ARI',
    season_year: FilterConfig.season_year[0].value,
    season_type: FilterConfig.season_type[0].value,
    location: FilterConfig.location[0].value,
    view: 'table'
  };

  const { filters, setFilter } = useUrlFilters(defaults);
  const statsToShow = PositionStatMap[filters.position] || [];

  const viewMode = filters.view || 'table';
  const setViewMode = (mode) => setFilter('view', mode);

  const [chartSelections, setChartSelections] = useState(() => {
    const saved = localStorage.getItem('trend_chart_preferences');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('trend_chart_preferences', JSON.stringify(chartSelections));
  }, [chartSelections]);

  const handleStatToggle = (statKey) => {
    setChartSelections(prev => {
      const currentPos = filters.position;
      const currentSelections = prev[currentPos] || [statsToShow[0]?.key];

      const newSelections = currentSelections.includes(statKey)
        ? (currentSelections.length > 1 ? currentSelections.filter(k => k !== statKey) : currentSelections)
        : [...currentSelections, statKey];

      return { ...prev, [currentPos]: newSelections };
    });
  };

  const {
    flatData,
    stats,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePositionOpponentData(
    filters,
    viewMode === 'chart',
    user
  );

  const customGetters = useMemo(() => ({
    week: (log) => log.game?.week ?? 0,
  }), []);

  const { sortedItems: sortedGameLogs, handleHeaderClick, sortConfig } = useUrlTableSort(flatData, customGetters);

  return (
    <>
      <UpcomingGames />
      <div className="bg-background">
        <FilterSection
          filters={filters}
          onFilterChange={setFilter}
          stats={stats}
          isLoading={isLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div className="container mx-auto p-4 md:px-8 relative">
          {viewMode === 'table' ? (
            <ResultsTable
              isLoading={isLoading}
              data={sortedGameLogs}
              statsToShow={statsToShow}
              sortConfig={sortConfig}
              onHeaderClick={handleHeaderClick}
            />
          ) : user ? (
            <PvOChart
              key={filters.position}
              sortedGameLogs={sortedGameLogs}
              statsToShow={statsToShow}
              filters={filters}
              selectedKeys={chartSelections[filters.position]}
              onToggleStat={handleStatToggle}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 border border-geodude-800 rounded-lg bg-geodude-900 font-mono text-paper-500">
              <Lock size={32} className="text-geodude-700" />
              <div className='text-center text-sm text-paper-500'>
                <Link to='/signup' className='font-semibold text-paper-300 hover:text-foreground hover:underline transition-colors'>
                  Log in
                </Link>
                {' '}to view the Trend Chart
              </div>
            </div>
          )}
        </div>

        {viewMode === 'table' && (
          <LoadMoreButton
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
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