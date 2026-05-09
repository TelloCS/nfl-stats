import { useParams, useNavigate  } from "react-router-dom";

import CustomLoader from "../components/CustomLoader";
import UpcomingGames from "../components/UpcomingGames";
import PlayerPerformanceSection from "../components/PlayerPerformanceSection";
import MatchupAnalysisSection from "../components/MatchupAnalysisSection";
import useUrlFilters from "../hooks/useUrlFilters"

import { FilterConfig } from "../components/Config";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createPlayerStatsQueryOptions from '../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

export default function PlayerDashboard() {
  const { player_id, player_slug } = useParams();
  const { filters, setFilter } = useUrlFilters({ season_year: FilterConfig.season_year[0].value, season_type: "2" });
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

  const isPending = isPlayerPending || isRankingPending;
  const isError = isPlayerError || isRankingError;
  const hasRankings = rankingData && rankingData.length > 0;

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
          <div className="container mx-auto p-4 md:p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={playerData?.stats.length > 0 && hasRankings ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-3"}>
                <PlayerPerformanceSection
                  data={playerData}
                  onFilterChange={setFilter}
                  filters={filters}
                  className="h-full"
                />
              </div>
              {hasRankings && !!playerData?.stats.length && (
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