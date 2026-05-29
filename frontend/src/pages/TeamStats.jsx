import { useMemo, memo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronUp, ChevronDown, SearchX } from 'lucide-react';

import { TeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import useUrlTableSort from '../hooks/useUrlTableSort';

import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createTeamStatsQueryOptions from '../queryOptions/createTeamStatsQueryOptions';

import { FilterConfig } from "../components/Config";
import useUrlFilters, { sortParams } from "../hooks/useUrlFilters";
import SelectDropdown from "../components/SelectDropdown";

export default function TeamStats() {
  const { filters, setFilter } = useUrlFilters({
    season_year: FilterConfig.season_year[0].value
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: teamData, isLoading } = useVersionedQuery(createTeamStatsQueryOptions, filters);

  const availableTabs = useMemo(() => {
    if (!teamData || teamData.length === 0) return [];
    const firstTeam = teamData[0];

    return TeamStatMap.filter(tab => firstTeam?.[tab.key] != null);
  }, [teamData]);

  const activeTabKey = searchParams.get("tab");

  const activeTabConfig = useMemo(() => {
    const current = availableTabs.find(t => t.key === activeTabKey);
    return current || availableTabs[0] || TeamStatMap[0];
  }, [activeTabKey, availableTabs]);

  const _activeTabKey = activeTabConfig.key;

  useEffect(() => {
    if (!isLoading && teamData?.length > 0 && availableTabs.length > 0) {
      const isTabValid = availableTabs.some(t => t.key === activeTabKey);

      if (!isTabValid) {
        setSearchParams((prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("tab", _activeTabKey);
          return sortParams(updated);
        }, { replace: true }); 
      }
    }
  }, [isLoading, teamData, availableTabs, activeTabKey, _activeTabKey, setSearchParams]);

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
    setSearchParams((prevParams) => {
      const updatedParams = new URLSearchParams(prevParams);
      updatedParams.set("tab", newTabKey);
      return sortParams(updatedParams);
    });
  };

  return (
    <>
      <UpcomingGames />
      <div className="bg-background text-paper-200">
        <FilterSection
          tabs={availableTabs}
          activeTabKey={_activeTabKey}
          onTabChange={handleTabChange}
          filters={filters}
          setFilter={setFilter}
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
    </>
  );
}

const FilterSection = memo(({ tabs, activeTabKey, onTabChange, filters, setFilter }) => (
  <div className="border-b border-geodude-800">
    <div className="container mx-auto px-4 md:px-8 py-4 bg-background flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

      <div className="w-full md:w-auto overflow-x-auto hide-scrollbar">
        <div className="flex gap-1.5 pb-2 flex-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors
              ${activeTabKey === tab.key
                  ? 'bg-geodude-800 text-foreground border border-geodude-800'
                  : 'bg-geodude-900 text-paper-400 border border-geodude-800 hover:bg-geodude-800 hover:text-paper-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-auto">
        <SelectDropdown
          value={filters?.season_year}
          onChange={(v) => setFilter('season_year', v)}
          options={FilterConfig.season_year}
          minWidth="120px"
        />
      </div>

    </div>
  </div>
));

const ResultsTable = memo(({ isLoading, data, columnsToShow, tableKey, sortConfig, onHeaderClick }) => {
  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-paper-500 border border-geodude-800 rounded-lg bg-geodude-900 font-mono">
        Loading team data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 border border-geodude-800 rounded-lg bg-geodude-900 font-mono text-paper-500">
        <SearchX size={32} className="text-geodude-700" />
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
      <table className="w-full border-collapse border-spacing-0 text-left">
        <thead className="bg-geodude-950 text-paper-400 h-[40px]">
          <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3">
            <th className="text-nowrap sticky left-0 bg-geodude-950 z-10">
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
        <tbody className="divide-y divide-geodude-800/50">
          {data.map((team, index) => (
            <tr key={team.id || index} className="group hover:bg-geodude-800/50 transition duration-150 h-[48px] text-xs text-paper-300">
              <td className="px-2 text-nowrap font-medium text-foreground sticky left-0 bg-geodude-900 group-hover:bg-geodude-800 transition-colors">
                {team.full_name}
              </td>

              {columnsToShow.map((stat) => (
                <td key={stat.key} className="px-2 text-nowrap text-left font-mono text-paper-200">
                  {team[tableKey]?.[stat.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="cursor-pointer hover:text-foreground transition-colors group">
    <div className="flex gap-1">
      <span>{label}</span>
      <div className="w-3 flex items-center justify-center text-geodude-700 group-hover:text-primary transition-colors">
        {activeSort?.key === sortKey ? (
          activeSort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </div>
  </th>
);