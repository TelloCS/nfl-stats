import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { TeamYearlyChart } from "./TeamYearlyChart";
import { usePlayersByPosition, generateRankOptions } from "./Team.helper";
import { PlayerPositionGroup } from "./PlayerPositionGroup";

import StatToggle from "../StatToggle";
import SelectDropdown from "../SelectDropdown";

import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import createTeamQueryOptions from "../../queryOptions/createTeamQueryOptions";
import createTeamRanksQueryOptions from "../../queryOptions/craeteTeamRanksQueryOptions";
import createTeamRosterQueryOptions from "../../queryOptions/createTeamRosterQueryOptions";

export default function Team() {
  const { team_slug } = useParams();
  const [currentStatKey, setCurrentStatKey] = useState("");

  const { data: teamData, isFetching: teamDataFetching } = useVersionedQuery(
    createTeamQueryOptions,
    team_slug
  );

  const { data: teamRoster, isFetching: teamRosterFetching } = useVersionedQuery(
    createTeamRosterQueryOptions,
    team_slug
  );

  const groupedPlayers = usePlayersByPosition(teamRoster);

  const { data: teamRanks, isFetching: teamRanksFetching } = useVersionedQuery(
    createTeamRanksQueryOptions,
    team_slug
  );

  const rankOptions = useMemo(() => {
    return generateRankOptions(teamRanks?.[0]);
  }, [teamRanks]);

  const activeStatKey = currentStatKey || (rankOptions.length > 0 ? rankOptions[0].value : "");
  const activeStatLabel = rankOptions.find(stat => stat.value === activeStatKey)?.label;

  const startYear = teamRanks?.length ? Math.min(...teamRanks.map(r => r.season_year)) : "";
  const endYear = teamRanks?.length ? Math.max(...teamRanks.map(r => r.season_year)) : "";
  const yearRange = startYear && endYear ? `${startYear} - ${endYear}` : "";

  if (teamDataFetching || teamRosterFetching || teamRanksFetching) {
    return (
      <div className="flex justify-center items-center">
        <span className="text-xl text-paper-400">...</span>
      </div>
    );
  };

  return (
    <div className='container mx-auto sm:p-4 md:px-8 font-poppins text-foreground'>
      <div className="bg-geodude-900 p-4 sm:p-6 sm:rounded-md sm:border sm:border-geodude-800 flex flex-col">

        <div className="p-4 md:p-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {teamData?.full_name}
          </h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-geodude-950 text-sm font-medium">
              {teamData?.conference}
            </span>
            <span className="px-3 py-1 bg-geodude-950 text-sm font-medium">
              {teamData?.division}
            </span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <PlayerPositionGroup players={groupedPlayers?.["QB"]} position="QB" />
            <PlayerPositionGroup players={groupedPlayers?.["RB"]} position="RB" />
            <PlayerPositionGroup players={groupedPlayers?.["WR"]} position="WR" />
            <PlayerPositionGroup players={groupedPlayers?.["TE"]} position="TE" />
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-geodude-950 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center text-paper-400 justify-between mb-4 gap-4">
              <div className="flex flex-col text-center text-foreground sm:text-left">
                <div className="text-xl sm:text-2xl">
                  Team Performance Trend
                </div>
                <div className="text-sm font-medium">{yearRange}</div>
              </div>

              <SelectDropdown
                value={activeStatKey}
                onChange={setCurrentStatKey}
                options={rankOptions}
                minWidth="160px"
              />
            </div>

            <TeamYearlyChart
              teamRanks={teamRanks}
              currentStatKey={activeStatKey}
              activeStatLabel={activeStatLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}