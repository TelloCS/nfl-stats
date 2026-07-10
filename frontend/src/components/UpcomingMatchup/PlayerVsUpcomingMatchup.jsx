import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import createPlayerVsUpcomingMatchupsQueryOptions from "../../queryOptions/createPlayerVsUpcomingMatchupsQueryOptions";

import { getMatchupData } from "./UpcomingMatchup.helpers";
import Table from "./Table";
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
    <Table
      data={filteredData}
      availableStats={availableStats}
    />
  )
};

export default PlayerVsUpcomingMatchup;