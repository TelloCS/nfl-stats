import { memo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CustomLoader from "../components/CustomLoader";
import UpcomingGames from "../components/UpcomingGames";
import PlayerPerformanceSection from "../components/PlayerPerformance";
import PlayerCareerStats from "../components/PlayerPerformance/PlayerCareerStats";
import UpcomingMatchup from "../components/UpcomingMatchup";
import MatchupAnalysisSection from "../components/MatchupAnalysis";
import Rosters from "../components/Rosters/Rosters";
import useUrlFilters from "../hooks/useUrlFilters"
import useMatchupData from "../hooks/useMatchupData";

import { FilterConfig } from "../components/Config";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createPlayerStatsQueryOptions from '../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

const DEFAULTS = { season_year: "", season_type: "" }

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

  const effectiveSeasonYear = playerData?.active_season;
  const rankingFilters = {
    ...filters,
    ...(effectiveSeasonYear ? { season_year: effectiveSeasonYear } : {})
  };

  const {
    data: rankingData,
    isPending: isRankingPending,
    isError: isRankingError
  } = useVersionedQuery(
    createTeamStatsRanksQueryOptions,
    rankingFilters,
    {
      enabled: Boolean(effectiveSeasonYear)
    }
  );

  const playerTeam = playerData?.team?.abbreviation;
  const { nextGame, isSchedulePending, isRanksPending } = useMatchupData(playerTeam);

  const hasStats = Boolean(playerData?.stats?.length > 0);
  const hasRankings = Boolean(rankingData?.length > 0);
  const isFreeAgent = Boolean(playerData?.team?.full_name === "Free Agent" || !playerData?.team);

  const showMatchupAnalysis = hasStats && hasRankings;
  const showUpcomingMatchup = !isFreeAgent;
  const isSplitLayout = showMatchupAnalysis && showUpcomingMatchup && nextGame;

  if (isPlayerPending || isRankingPending || isSchedulePending || isRanksPending) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <CustomLoader />
      </div>
    )
  } else if (isPlayerError || isRankingError) {
    return (
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
    )
  }

  return (
    <div className="container mx-auto sm:p-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 sm:gap-4">

        <div className={`flex flex-col gap-0.5 sm:gap-4 ${isSplitLayout ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <PlayerPerformanceSection
            data={playerData}
            onFilterChange={setFilter}
            filters={filters}
          />
          <div className={`flex flex-col grid grid-cols-1 gap-0.5 ${showMatchupAnalysis ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} sm:gap-4 lg:gap-4`}>
            {showMatchupAnalysis && (
              <MatchupAnalysisSection
                key={playerData?.id}
                data={playerData}
                rankingData={rankingData}
              />
            )}
            <Rosters data={playerData} showMatchup={showMatchupAnalysis} />
          </div>
        </div>

        {showUpcomingMatchup && (
          <div className={isSplitLayout ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <UpcomingMatchup
              playerData={playerData}
              showMatchup={isSplitLayout}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PlayerDashboard);