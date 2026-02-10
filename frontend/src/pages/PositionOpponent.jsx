import { useMemo } from 'react';
import { ChevronUp, ChevronDown, Loader2, Search, Database, Layers } from 'lucide-react';
import { PositionStatMap, FilterConfig, Positions, TeamAbbreviations } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
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
      <div className="bg-gray-50 border-b border-neutral-200">
        <div className="container mx-auto flex flex-col px-8 py-6 gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <FilterSelect value={filters.season_year} onChange={(v) => setFilter('season_year', v)} options={FilterConfig.season_year} minWidth="90px" />
            <FilterSelect value={filters.season_type} onChange={(v) => setFilter('season_type', v)} options={FilterConfig.season_type} minWidth="140px" />
            <FilterSelect value={filters.location} onChange={(v) => setFilter('location', v)} options={FilterConfig.location} minWidth="110px" />

            <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

            <FilterSelect value={filters.opponent} onChange={(v) => setFilter('opponent', v)} options={TeamAbbreviations} minWidth="120px" />
            <FilterSelect value={filters.position} onChange={(v) => setFilter('position', v)} options={Positions} minWidth="100px" />
          </div>
          {!isLoading && stats.totalCount > 0 && (
            <div className="mt-2">
              <StatsSummary stats={stats} />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto flex flex-col p-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0">
            <thead className="bg-gray-100 text-neutral-600 h-[40px]">
              <tr className="border-b border-neutral-200 uppercase text-xs [&>th]:font-semibold">
                <SortableTh label="Week" sortKey="week" activeSort={sortConfig} onClick={() => handleHeaderClick('week')} />
                <th className="px-2 text-nowrap text-center">Player</th>
                <th className="px-2 text-nowrap text-center">Position</th>
                <th className="px-2 text-nowrap text-center">Team</th>
                <th className="px-2 text-nowrap text-center">Matchup</th>
                <th className="px-2 text-nowrap text-center">Score</th>
                {statsToShow.map((stat) => (
                  <SortableTh
                    key={stat.key}
                    label={stat.label}
                    sortKey={stat.key}
                    activeSort={sortConfig}
                    onClick={() => handleHeaderClick(stat.key)}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr><td colSpan="100%" className="p-12 text-center text-gray-500">Loading player data...</td></tr>
              ) : sortedGameLogs?.length > 0 ? (
                sortedGameLogs.map((log) => (
                  <tr key={log.id} className="odd:bg-white even:bg-gray-50 hover:bg-emerald-50 transition duration-150 h-[48px] border-b border-neutral-100 last:border-0 text-sm">
                    <td className="px-2 text-nowrap text-center">{log.game.week}</td>
                    <td className="px-2 text-nowrap text-center">{log.player.fullName}</td>
                    <td className="px-2 text-nowrap text-center">{log.player.position}</td>
                    <td className="px-2 text-nowrap text-center">{log.player.team.abbreviation}</td>
                    <td className="px-2 text-nowrap text-center">{log.game.short_name}</td>
                    <td className="px-2 text-nowrap text-center">{log.game.home_score} - {log.game.away_score}</td>
                    {statsToShow.map((statConfig) => (
                      <td key={statConfig.key} className="text-nowrap text-center">
                        {log[statConfig.key] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="100%" className="p-12 text-center text-gray-500">No results found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {hasNextPage && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-3 bg-white border border-neutral-300 text-neutral-700 px-8 py-3 rounded-full text-sm font-bold hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:shadow-none transition-all duration-200 ease-in-out"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="animate-spin text-neutral-500" size={18} />
                  <span className="text-neutral-500">Loading more...</span>
                </>
              ) : (
                <>
                  <span>Load More Games</span>
                  <Search size={16} className="text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const FilterSelect = ({ value, onChange, options, minWidth = "100px" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`bg-white border-2 border-neutral-200 px-4 rounded-md h-10 hover:cursor-pointer min-w-[${minWidth}] text-sm`}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label || opt.value}
      </option>
    ))}
  </select>
);

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="cursor-pointer hover:bg-gray-200">
    <div className="flex items-center justify-center">
      <div className="w-4" aria-hidden="true"></div>
      <span className="flex-1 text-center">{label}</span>
      <div className="w-4 flex items-center justify-center">
        {activeSort?.key === sortKey && (
          activeSort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </div>
    </div>
  </th>
);

const StatsSummary = ({ stats }) => (
  <div className="flex items-center gap-6 text-xs font-medium text-gray-500 pt-2 border-t border-gray-200 mt-2">
    <div className="flex items-center gap-2">
      <Database size={14} className="text-gray-400" />
      <span>Total Entries: <strong className="text-gray-700">{stats.totalCount.toLocaleString()}</strong></span>
    </div>
    <div className="flex items-center gap-2">
      <Layers size={14} className="text-gray-400" />
      <span>Total Pages: <strong className="text-gray-700">{stats.totalPages}</strong></span>
    </div>
    <div className="ml-auto">
      Showing <strong className="text-gray-700">{stats.loadedCount}</strong> of {stats.totalCount.toLocaleString()}
    </div>
  </div>
);