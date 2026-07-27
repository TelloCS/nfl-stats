import { useMemo } from "react";
import useTeamRanks from "./useTeamRanks";
import useUpcomingGames from "./useUpcomingGames";
import { getMatchupData } from "../components/UpcomingMatchup/UpcomingMatchup.helpers";

export default function useMatchupData(playerTeamAbbreviation) {
  const { data: scheduleData, isPending: isSchedulePending } = useUpcomingGames();
  const { data: rankData, isPending: isRanksPending } = useTeamRanks();

  const matchupInfo = useMemo(() => {
    return getMatchupData(scheduleData, rankData, playerTeamAbbreviation) || {};
  }, [scheduleData, rankData, playerTeamAbbreviation]);

  return {
    ...matchupInfo,
    rankData,
    scheduleData,
    isSchedulePending,
    isRanksPending,
  };
}