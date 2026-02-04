import { useState, useMemo } from "react";
import { PositionStatMap, NFL_POSITIONS, NFL_TEAMS } from '../components/Config';
import { useSearchParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import UpcomingGames from '../components/UpcomingGames';
import { ChevronUp, ChevronDown } from 'lucide-react';

import createPositionOpponentQueryOptions from "../queryOptions/createPositionOpponentQueryOptions";

export default function PositionOpponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPosition, setSelectedPosition] = useState(searchParams.get("position") || 'QB');
  const [selectedOpponent, setSelectedOpponent] = useState(searchParams.get("opponent") || 'ARI');

  const [searchQuery, setSearchQuery] = useState({
    position: selectedPosition,
    opponent: selectedOpponent
  });

  const [sort, setSort] = useState({ keyToSort: '', direction: '' });
  const [statsToShow, setStatsToShow] = useState(PositionStatMap[searchQuery.position]);

  const { data: positionOpponentData, isLoading: positionOpponentIsLoading } = useQuery(createPositionOpponentQueryOptions(searchQuery.position, searchQuery.opponent));

  const handleHeaderClick = (header) => {
    setSort((prev) => ({
      keyToSort: header.key,
      direction: header.key === prev.keyToSort && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedArray = (arrayToSort) => {
    if (!sort.keyToSort || !arrayToSort) return arrayToSort;

    return [...arrayToSort].sort((a, b) => {
      let aValue, bValue;

      if (sort.keyToSort === 'week') {
        aValue = a.game?.week ?? 0;
        bValue = b.game?.week ?? 0;
      } else {
        aValue = a[sort.keyToSort] ?? 0;
        bValue = b[sort.keyToSort] ?? 0;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const sortedGameLogs = useMemo(() => {
    return getSortedArray(positionOpponentData);
  }, [positionOpponentData, sort]);

  const handleSearch = () => {
    setSearchQuery({
      position: selectedPosition,
      opponent: selectedOpponent
    });

    setStatsToShow(PositionStatMap[selectedPosition]);
    setSearchParams({
      position: selectedPosition,
      opponent: selectedOpponent
    });
  };

  return (
    <>
      <UpcomingGames />
      <div className="bg-gray-50 border-b border-neutral-200">
        <div className="container mx-auto flex px-8 py-4 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedOpponent}
              onChange={(e) => setSelectedOpponent(e.target.value)}
              className="bg-white border-2 border-neutral-200 px-4 rounded-md h-10 hover:cursor-pointer min-w-[120px]"
            >
              {NFL_TEAMS.map((team) => (
                <option key={team.value} value={team.value}>
                  {team.label || team.value}
                </option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-white border-2 border-neutral-200 px-4 rounded-md h-10 hover:cursor-pointer min-w-[100px]"
            >
              {NFL_POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label || pos.value}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="bg-[#333333] text-white px-8 rounded-md h-10 font-bold hover:bg-indigo-400 transition-colors disabled:bg-gray-400"
              disabled={positionOpponentIsLoading}
            >
              {positionOpponentIsLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="container mx-auto flex p-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0 text-xs">
            <thead className="bg-gray-100 text-neutral-600">
              <tr>
                <th
                  onClick={() => handleHeaderClick({ key: 'week' })}
                  className="px-2 border-b border-neutral-200 font-semibold uppercase text-xs h-[40px] cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-4" aria-hidden="true"></div>
                    <span className="flex-1 text-center">Week</span>
                    <div className="w-4 flex items-center justify-center">
                      {sort.keyToSort === 'week' && (
                        sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Player</th>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Position</th>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Team</th>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Matchup</th>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Score</th>
                {statsToShow.map((stat) => (
                  <th
                    key={stat.key}
                    onClick={() => handleHeaderClick(stat)}
                    className="px-2 border-b border-neutral-200 font-semibold uppercase text-xs h-[40px] cursor-pointer hover:bg-gray-200 min-w-[90px]"
                  >
                    <div className="flex items-center justify-center">
                      <div className="w-4" aria-hidden="true"></div>
                      <span className="flex-1 text-center">{stat.label}</span>
                      <div className="w-4 flex items-center justify-center">
                        {sort.keyToSort === stat.key && (
                          sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {positionOpponentIsLoading ? (
                <tr>
                  <td colSpan="100%" className="p-12 text-center text-gray-500 text-lg">
                    Loading player data...
                  </td>
                </tr>
              ) : sortedGameLogs?.length > 0 ? (
                sortedGameLogs.map((log) => (
                  <tr key={log.id} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50 transition duration-150">
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.game.week}</td>
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.fullName}</td>
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.position}</td>
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.team.abbreviation}</td>
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.game.short_name}</td>
                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">
                      {log.game.home_score} - {log.game.away_score}
                    </td>
                    {statsToShow.map((statConfig) => (
                      <td key={statConfig.key} className="px-2 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">
                        {log[statConfig.key] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="100%" className="p-12 text-center text-gray-500">
                    No results found for {searchQuery.position} vs {searchQuery.opponent}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};