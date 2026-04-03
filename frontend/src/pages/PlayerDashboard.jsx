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
  const { filters, setFilter } = useUrlFilters({ season_year: "" });

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
    createTeamStatsRanksQueryOptions
  );

  const isPending = isPlayerPending || isRankingPending;
  const isError = isPlayerError || isRankingError;

  return (
    <>
      <UpcomingGames />
      <div className="bg-[#000000] min-h-screen relative group">
        {isPending ? (
          <div className="flex justify-center items-center h-[500px]">
            <CustomLoader />
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center h-[500px] text-white">
            <h2 className="text-3xl font-bold mb-2 uppercase">Player Not Found</h2>
            <p className="text-neutral-500">
              {playerError?.response?.status === 404
                ? "The requested NFL player stats could not be located."
                : "An unexpected error occurred while fetching stats."}
            </p>
          </div>
        ) : (
          <div className="container mx-auto p-4 md:p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <PlayerPerformanceSection data={playerData} onFilterChange={setFilter} />
              </div>
              <div className="col-span-1">
                <MatchupAnalysisSection games={playerData?.stats} rankingData={rankingData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}