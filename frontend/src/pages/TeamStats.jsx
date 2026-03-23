import { useMemo, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronUp, ChevronDown } from 'lucide-react';

import { TeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import useUrlTableSort from '../hooks/useUrlTableSort';

import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createTeamStatsQueryOptions from '../queryOptions/createTeamStatsQueryOptions';

export default function TeamStats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: teamData, isLoading } = useVersionedQuery(createTeamStatsQueryOptions);

  const activeTabKey = searchParams.get("tab") || TeamStatMap[0].key;

  const activeTabConfig = useMemo(() =>
    TeamStatMap.find(t => t.key === activeTabKey) || TeamStatMap[0],
    [activeTabKey]
  );

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
    <div className="min-h-screen bg-[#000000] text-neutral-200">
      <UpcomingGames />
      
      <FilterSection 
        activeTabKey={activeTabConfig.key} 
        onTabChange={handleTabChange} 
      />

      <div className="container mx-auto flex flex-col p-4 md:p-8">
        <ResultsTable 
          isLoading={isLoading}
          data={sortedItems}
          columnsToShow={columnsToShow}
          tableKey={tableKey}
          sortConfig={sortConfig}
          onHeaderClick={handleHeaderClick}
        />
      </div>
    </div>
  );
}

const FilterSection = memo(({ activeTabKey, onTabChange }) => (
  <div className="bg-[#000000] border-b border-neutral-800">
    <div className="container mx-auto flex px-4 md:px-8 py-4 overflow-x-auto hide-scrollbar">
      <div className="flex flex-nowrap gap-2 pt-1">
        {TeamStatMap.map((tab) => (
          <button 
            key={tab.key} 
            onClick={() => onTabChange(tab.key)}
            className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors
              ${activeTabKey === tab.key
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </div>
));

const ResultsTable = memo(({ isLoading, data, columnsToShow, tableKey, sortConfig, onHeaderClick }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 hide-scrollbar font-mono">
    <table className="w-full border-collapse border-spacing-0 text-left">
      <thead className="bg-neutral-950 text-neutral-400 h-[40px]">
        <tr className="border-b border-neutral-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3">
          <th className="text-nowrap sticky left-0 bg-neutral-950 z-10">
            Team
          </th>
          {columnsToShow.map((stat) => (
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
      <tbody className="divide-y divide-neutral-800/50">
        {isLoading ? (
          <tr>
            <td colSpan="100%" className="p-12 text-center text-neutral-500">Loading team data...</td>
          </tr>
        ) : data?.length > 0 ? (
          data.map((team, index) => (
            <tr key={team.id || index} className="group hover:bg-neutral-800/50 transition duration-150 h-[48px] text-xs text-neutral-300">
              <td className="px-2 text-nowrap font-medium text-white sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                {team.full_name}
              </td>

              {columnsToShow.map((stat) => (
                <td key={stat.key} className="px-2 text-nowrap text-left font-mono text-neutral-200">
                  {team[tableKey]?.[stat.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="100%" className="p-12 text-center text-neutral-500">No results found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
));

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="cursor-pointer hover:text-white transition-colors group">
    <div className="flex gap-1">
      <span>{label}</span>
      <div className="w-3 flex items-center justify-center text-neutral-600 group-hover:text-emerald-500 transition-colors">
        {activeSort?.key === sortKey ? (
          activeSort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </div>
  </th>
);