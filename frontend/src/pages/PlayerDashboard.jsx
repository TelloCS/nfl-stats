import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

import CustomLoader from "../components/CustomLoader";
import UpcomingGames from "../components/UpcomingGames";
import PlayerPerformanceSection from "../components/PlayerPerformanceSection";
import MatchupAnalysisSection from "../components/MatchupAnalysisSection";

import createPlayerStatsQueryOptions from '../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

export default function PlayerDashboard() {
  const { player_id, player_slug } = useParams();

  const { data: playerData, isPending: isPlayerPending } = useQuery(createPlayerStatsQueryOptions(player_id, player_slug));
  const { data: rankingData, isPending: isRankingPending } = useQuery(createTeamStatsRanksQueryOptions());

  const isPending = isPlayerPending || isRankingPending;

  return (
    <>
      <UpcomingGames />
      <div className="bg-[#000000] min-h-screen relative group">
        {isPending ? (
          <div className="flex justify-center items-center h-[500px]">
            <CustomLoader />
          </div>
        ) : (
          <div className="container mx-auto p-4 md:p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <PlayerPerformanceSection data={playerData} />
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