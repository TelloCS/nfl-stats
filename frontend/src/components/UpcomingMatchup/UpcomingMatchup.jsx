import { memo, useState, useMemo } from "react";
import { TeamRankingStatMap, PositionStatMap } from "../Config";
import useTeamRanks from "../../hooks/useTeamRanks";
import useUpcomingGames from "../../hooks/useUpcomingGames";
import StatRow from "./StatRow";
import TeamSchemes from "./TeamSchemes";
import MatchupHeader from "./MatchupHeader";
import YardsAllowedPosition from "./YardsAllowedPosition";
import TeamSideSelector from "./TeamSideSelector";
import PlayerVsUpcomingMatchup from "./PlayerVsUpcomingMatchup";
import { getMatchupData } from "./UpcomingMatchup.helpers";

function UpcomingMatchup({ playerData, showMatchup }) {
  const [playerSide, setPlayerSide] = useState("off");
  const [opponentSide, setOpponentSide] = useState("def");

  const { data: scheduleData, isPending: isSchedulePending } = useUpcomingGames();
  const { data: rankData, isPending: isRanksPending } = useTeamRanks();

  const playerTeam = playerData?.team?.abbreviation;

  const { nextGame, playerRanks, opponentRanks } = useMemo(() => {
    return getMatchupData(scheduleData, rankData, playerTeam) || {};
  }, [scheduleData, rankData, playerTeam]);

  const displaySeason = 2025;

  if (isSchedulePending || isRanksPending) {
    return null;
  }

  if (!nextGame || !opponentRanks || !playerRanks) {
    return null;
  }

  return (
    <div className="mb-2 h-full font-mono">
      <div className="bg-geodude-900 sm:rounded-md border border-geodude-800 p-4 flex flex-col gap-4">
        <MatchupHeader shortName={nextGame.shortName} date={nextGame.date} />
        <div className={`grid gap-4 grid-cols-1 ${!showMatchup ? 'lg:grid-cols-3' : ''}`}>

          {/* Play Calling Rate Section */}
          <div className={`bg-geodude-950 border border-geodude-800 rounded-xl p-2 md:p-4 flex flex-col h-full ${showMatchup ? 'order-1' : 'order-2'}`}>
            <p className="text-base font-bold text-foreground mb-4 text-center tracking-wide">
              Play Calling Rate <span className="text-paper-400 font-normal">({displaySeason})</span>
            </p>

            <div className="flex justify-between h-full items-center">
              <TeamSchemes
                abbreviation={playerRanks.team?.abbreviation}
                side={playerSide}
                ranks={playerRanks}
              />
              <TeamSchemes
                abbreviation={opponentRanks.team?.abbreviation}
                side={opponentSide}
                ranks={opponentRanks}
                isOpponent
              />
            </div>
          </div>

          {/* Team Rankings Section */}
          <div className={`bg-geodude-950 border border-geodude-800 rounded-xl p-2 md:p-4 flex flex-col h-full ${showMatchup ? 'order-2' : 'order-1'}`}>
            <p className="text-base font-bold text-foreground mb-2 text-center tracking-wide">
              Team Rankings <span className="text-paper-400 font-normal">({displaySeason})</span>
            </p>

            <div className="grid grid-cols-3 gap-3 items-center border-b border-geodude-800 pb-4 mb-4">
              <TeamSideSelector
                abbreviation={playerRanks.team?.abbreviation}
                side={playerSide}
                setSide={setPlayerSide}
              />
              <span className="text-center text-xs font-black tracking-widest text-paper-500 mt-4">VS</span>
              <TeamSideSelector
                abbreviation={opponentRanks.team?.abbreviation}
                side={opponentSide}
                setSide={setOpponentSide}
                isOpponent
              />
            </div>

            <div className="flex flex-col gap-1 text-sm justify-center grow">
              <StatRow
                label="Pass Yds"
                playerVal={playerRanks[`${playerSide}_pass_yards_rank`]}
                opponentVal={opponentRanks[`${opponentSide}_pass_yards_rank`]}
              />
              <StatRow
                label="Rush Yds"
                playerVal={playerRanks[`${playerSide}_rush_yards_rank`]}
                opponentVal={opponentRanks[`${opponentSide}_rush_yards_rank`]}
              />
              <StatRow
                label="Pass EPA"
                playerVal={playerSide === "off"
                  ? playerRanks.off_expected_points_added_per_pass_rank
                  : playerRanks.def_expected_points_added_allowed_per_pass_rank}
                opponentVal={opponentSide === "off"
                  ? opponentRanks.off_expected_points_added_per_pass_rank
                  : opponentRanks.def_expected_points_added_allowed_per_pass_rank}
              />
              <StatRow
                label="Rush EPA"
                playerVal={playerSide === "off"
                  ? playerRanks.off_expected_points_added_per_rush_rank
                  : playerRanks.def_expected_points_added_allowed_per_rush_rank}
                opponentVal={opponentSide === "off"
                  ? opponentRanks?.off_expected_points_added_per_rush_rank
                  : opponentRanks.def_expected_points_added_allowed_per_rush_rank}
              />
            </div>
          </div>

          {/* Yards Allowed Position Section */}
          <div className="order-3 bg-geodude-950 p-2 md:p-4 h-full rounded-xl border border-geodude-800 flex flex-col justify-center">
            <YardsAllowedPosition
              playerAbbreviation={playerRanks?.team?.abbreviation}
              opponentAbbreviation={opponentRanks?.team?.abbreviation}
              playerRanks={playerRanks}
              opponentRanks={opponentRanks}
              displaySeason={displaySeason}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default memo(UpcomingMatchup);