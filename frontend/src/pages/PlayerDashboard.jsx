import { memo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CustomLoader from "../components/CustomLoader";
import UpcomingGames from "../components/UpcomingGames";
import PlayerPerformanceSection from "../components/PlayerPerformance";
import MatchupAnalysisSection from "../components/MatchupAnalysis";
import useUrlFilters from "../hooks/useUrlFilters"

import { FilterConfig } from "../components/Config";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createPlayerStatsQueryOptions from '../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

const DEFAULTS = { season_year: "", season_type: "2" }

function PlayerDashboard() {
  const { player_id, player_slug } = useParams();
  const { filters, setFilter } = useUrlFilters(DEFAULTS);
  const navigate = useNavigate();

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

  const isPending = Boolean(isPlayerPending || isRankingPending);
  const isError = Boolean(isPlayerError || isRankingError);
  const hasRankings = Boolean(rankingData && rankingData?.length > 0);
  const showMatchup = Boolean(playerData?.stats?.length > 0 && hasRankings);

  return (
    <>
      <UpcomingGames />
      <div className="bg-background">
        {isPending ? (
          <div className="flex justify-center items-center h-[500px]">
            <CustomLoader />
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center h-[500px] text-foreground">
            <p className="text-paper-400 text-center max-w-md mb-8 px-2">
              {playerError?.status === 404
                ? "The requested NFL player stats could not be located."
                : "An unexpected error occurred while fetching stats."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-geodude-900 mt-8 px-6 py-3 border border-geodude-800 rounded-md font-bold hover:bg-geodude-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="container mx-auto p-4 md:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div className={showMatchup ? "lg:col-span-2" : "lg:col-span-3"}>
                <PlayerPerformanceSection
                  data={playerData}
                  onFilterChange={setFilter}
                  filters={filters}
                  className="h-full"
                />
              </div>
              {showMatchup && (
                <div className="col-span-1">
                  <MatchupAnalysisSection
                    games={playerData?.stats}
                    rankingData={rankingData}
                    className="h-full"
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

export default memo(PlayerDashboard);