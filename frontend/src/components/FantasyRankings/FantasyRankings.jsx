import { memo } from "react";
import { Loader2, Search } from 'lucide-react';
import { FilterConfig } from "../Config";
import { useFantasyRankings, Positions, TeamAbbreviations, SCORING_FORMATS } from "./FantasyRankings.helpers";

import Table from "./Table";
import FilterSection from "./FilterSection";
import UpcomingGames from '../UpcomingGames';
import useUrlFilters from "../../hooks/useUrlFilters";
import useUrlTableSort from "../../hooks/useUrlTableSort";

const DEFAULTS = {
  position: Positions.position[0].value,
  team: TeamAbbreviations.team[0].value,
  season_year: FilterConfig.season_year[0].value,
  season_type: FilterConfig.season_type[0].value,
  scoring_format: 'ppr_points'
};

function FantasyRankings() {
  const { filters, setFilter } = useUrlFilters(DEFAULTS);
  const isPositionFiltered = filters.position !== "";
  const {
    flatData,
    stats,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFantasyRankings(
    filters
  );

  const currentFormat = SCORING_FORMATS[filters.scoring_format] || SCORING_FORMATS.ppr_points;
  const { sortedItems: sortedRankings, handleHeaderClick, sortConfig } = useUrlTableSort(flatData);

  return (
    <>
      <UpcomingGames />
      <FilterSection
        filters={filters}
        onFilterChange={setFilter}
        stats={stats}
        isLoading={isLoading}
        positionConfig={Positions}
        teamConfig={TeamAbbreviations}
        SCORING_FORMATS={SCORING_FORMATS}
      />
      <div className="container mx-auto p-2 sm:p-4 md:px-8 relative">
        <div>
          <Table
            isPositionFiltered={isPositionFiltered}
            isLoading={isLoading}
            data={sortedRankings}
            currentFormat={currentFormat}
            sortConfig={sortConfig}
            onHeaderClick={handleHeaderClick}
          />
        </div>
        <LoadMoreButton
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </>
  )
}

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
            <span>Load More Players</span>
            <Search size={16} className="text-paper-500 group-hover:text-paper-300 transition-colors" />
          </>
        )}
      </button>
    </div>
  );
};

export default memo(FantasyRankings);