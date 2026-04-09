import { useParams } from "react-router-dom";

import CustomLoader from "../components/CustomLoader";
import UpcomingGames from "../components/UpcomingGames";
import PlayerPerformanceSection from "../components/PlayerPerformanceSection";
import MatchupAnalysisSection from "../components/MatchupAnalysisSection";
import useUrlFilters from "../hooks/useUrlFilters"

import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createPlayerStatsQueryOptions from '../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

export default function PlayerDashboard() {
  const { player_id, player_slug } = useParams();
  const { filters, setFilter } = useUrlFilters({ season_year: "", season_type: "" });

  const {
    data: playerData,
    isPending: isPlayerPending,
    isError: isPlayerError,
    error: playerError
  } = useVersionedQuery(
    createPlayerStatsQueryOptions,
    player_id,
    player_slug,
    filters
  );

  const {
    data: rankingData,
    isPending: isRankingPending,
    isError: isRankingError
  } = useVersionedQuery(
    createTeamStatsRanksQueryOptions,
    filters
  );

  const isPending = isPlayerPending || isRankingPending;
  const isError = isPlayerError || isRankingError;
  const hasRankings = rankingData && rankingData.length > 0;

  return (
    <>
      <UpcomingGames />
      <div className="bg-[#000000] min-h-[calc(100vh-218px)] relative group">
        {isPending ? (
          <div className="flex justify-center items-center h-[500px]">
            <CustomLoader />
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center h-[500px] text-white">
            <p className="text-center">
              {playerError?.status === 404
                ? "The requested NFL player stats could not be located."
                : "An unexpected error occurred while fetching stats."}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-neutral-900 mt-8 px-6 py-3 border border-neutral-800 rounded-md font-bold hover:bg-neutral-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="container mx-auto p-4 md:p-8 relative">
            {!hasRankings && filters?.season_year && (
              <div className="mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                <p className="text-neutral-400 text-sm">
                  <span className="text-amber-500 font-semibold">Note:</span> Matchup rankings are currently unavailable for the {filters.season_year} season.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={hasRankings ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-3"}>
                <PlayerPerformanceSection
                  data={playerData}
                  onFilterChange={setFilter}
                  filters={filters}
                  hasRankings={hasRankings}
                />
              </div>
              {hasRankings && (
                <div className="col-span-1">
                  <MatchupAnalysisSection
                    games={playerData?.stats}
                    rankingData={rankingData}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}