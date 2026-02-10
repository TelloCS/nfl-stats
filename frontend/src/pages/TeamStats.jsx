import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import createTeamStatsQueryOptions from '../queryOptions/createTeamStatsQueryOptions';
import useUrlTableSort from '../hooks/useUrlTableSort'

export default function TeamStats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: teamData } = useQuery(createTeamStatsQueryOptions());

  const activeTabKey = searchParams.get("tab") || TeamStatMap[0].key;

  const activeTabConfig = useMemo(() =>
    TeamStatMap.find(t => t.key === activeTabKey) || TeamStatMap[0],
    [activeTabKey]);

  const { key: tableKey, stats: columnsToShow } = activeTabConfig;

  const customGetters = useMemo(() => {
    const getters = {};
    columnsToShow.forEach(col => {
      getters[col.key] = (team) => {
        const val = team[tableKey]?.[col.key];
        return val ?? -Infinity;
      };
    });
    return getters;
  }, [columnsToShow, tableKey]);

  const { sortedItems, handleHeaderClick, sortConfig } = useUrlTableSort(teamData, customGetters);

  const handleTabChange = (newTabKey) => {
    setSearchParams({ tab: newTabKey });
  };

  return (
    <>
      <UpcomingGames />
      <div className="bg-gray-50 border-b border-neutral-200">
        <div className="container mx-auto flex px-8 py-4">
          <div className="flex flex-wrap gap-4 pt-[6px] text-[13px] font-normal">
            {TeamStatMap.map((tab) => (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors
                  ${activeTabConfig.key === tab.key
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto flex p-8">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0">
            <thead className="bg-gray-100 text-neutral-600">
              <tr>
                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-left text-xs h-[40px]">Team</th>
                {columnsToShow.map((stat) => (
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
            <tbody className="">
              {sortedItems?.map((team, index) => (
                <tr key={team.id || index} className="hover:bg-gray-50">
                  <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 bg-white text-left text-sm">
                    {team.full_name}
                  </td>

                  {/* DYNAMIC CELLS */}
                  {columnsToShow.map((stat) => (
                    <td key={stat.key} className="px-2 h-[48px] text-nowrap border-b border-neutral-200 bg-white text-center text-sm">
                      {/* We access the data using the same logic as the getter */}
                      {team[tableKey]?.[stat.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="px-2 border-b border-neutral-200 font-semibold uppercase text-xs h-[40px] cursor-pointer hover:bg-gray-200 min-w-[90px]">
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