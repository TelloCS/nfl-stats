import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import createPlayerVsUpcomingMatchupsQueryOptions from "../../queryOptions/createPlayerVsUpcomingMatchupsQueryOptions";

import { getMatchupData } from "./UpcomingMatchup.helpers";
import Table from "../PlayerPerformance/Table";
import useTeamRanks from "../../hooks/useTeamRanks";
import useUpcomingGames from "../../hooks/useUpcomingGames";

function PlayerVsUpcomingMatchup({ playerData, availableStats, seasonType }) {
  const { player_id, player_slug } = useParams();

  const { data: scheduleData } = useUpcomingGames();
  const { data: rankData } = useTeamRanks();

  const playerTeam = playerData?.team?.abbreviation;

  const { opponentRanks } = useMemo(() => {
    return getMatchupData(scheduleData, rankData, playerTeam) || {};
  }, [scheduleData, rankData, playerTeam]);

  const opponent = opponentRanks?.abbreviation;

  const filters = useMemo(() => ({
    team: opponent
  }), [opponent]);

  const {
    data,
  } = useVersionedQuery(
    createPlayerVsUpcomingMatchupsQueryOptions,
    player_id,
    player_slug,
    filters,
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data?.filter(row => String(row.game?.season_type) === String(seasonType));
  }, [data, seasonType]);

  return (
    <>
      {filteredData.length > 0 ? (
        <Table
          data={filteredData}
          availableStats={availableStats}
        />
      ) : (
        <div className="p-4 bg-geodude-900 border border-geodude-800 rounded-lg">
          <p className="text-paper-400 text-sm text-center">
            No upcoming matchup stats found.
          </p>
        </div>
      )}
    </>
  )
};

export default PlayerVsUpcomingMatchup;