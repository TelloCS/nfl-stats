import { useQuery } from '@tanstack/react-query';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { PositionStatMap, FilterConfig, Positions, TeamAbbreviations } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import createPositionOpponentQueryOptions from "../queryOptions/createPositionOpponentQueryOptions";
import useUrlTableSort from '../hooks/useUrlTableSort';
import useUrlFilters from '../hooks/useUrlFilters';

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

  const { data: positionOpponentData, isLoading: positionOpponentIsLoading } = useQuery(
    createPositionOpponentQueryOptions(
      filters.position,
      filters.opponent,
      filters.season_year,
      filters.season_type,
      filters.location
    ));

  const customGetters = {
    week: (log) => log.game?.week ?? 0,
  };

  const { sortedItems: sortedGameLogs, handleHeaderClick, sortConfig } = useUrlTableSort(
    positionOpponentData, customGetters
  );

  const onHeaderClick = (key) => {
     handleHeaderClick(key);
  };


  return (
    <>
      <UpcomingGames />
      <div className="bg-gray-50 border-b border-neutral-200">
        <div className="container mx-auto flex px-8 py-4 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <FilterSelect
              value={filters.season_year}
              onChange={(val) => setFilter('season_year', val)}
              options={FilterConfig.season_year}
              minWidth="90px"
            />
            <FilterSelect value={filters.season_type}
              onChange={(val) => setFilter('season_type', val)}
              options={FilterConfig.season_type}
              minWidth="140px"
            />
            <FilterSelect
              value={filters.location}
              onChange={(val) => setFilter('location', val)}
              options={FilterConfig.location}
              minWidth="110px"
            />
            <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>
            <FilterSelect
              value={filters.opponent}
              onChange={(val) => setFilter('opponent', val)}
              options={TeamAbbreviations}
              minWidth="120px"
            />

            <FilterSelect
              value={filters.position}
              onChange={(val) => setFilter('position', val)}
              options={Positions}
              minWidth="100px"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto flex p-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0">
            <thead className="bg-gray-100 text-neutral-600 h-[40px]">

              <tr className="border-b border-neutral-200 uppercase text-xs [&>th]:font-semibold">
                <SortableTh 
                  label="Week" 
                  sortKey="week" 
                  activeSort={sortConfig} 
                  onClick={() => onHeaderClick('week')} 
                />
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
                    onClick={() => onHeaderClick(stat.key)} 
                  />
                ))}
              </tr>

            </thead>
            <tbody className="">
              {positionOpponentIsLoading ? (
                <tr><td colSpan="100%" className="p-12 text-center text-gray-500">Loading...</td></tr>
              ) : sortedGameLogs?.length > 0 ? (
                sortedGameLogs.map((log) => (
                  <tr key={log.id} className="odd:bg-white even:bg-gray-100 hover:bg-emerald-50 transition duration-150 h-[48px] border-b border-neutral-200 text-sm">
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