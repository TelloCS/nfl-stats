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

function UpcomingMatchup({ playerData }) {
  const [playerSide, setPlayerSide] = useState("off");
  const [opponentSide, setOpponentSide] = useState("def");

  const { data: scheduleData, isPending: isSchedulePending } = useUpcomingGames();
  const { data: rankData, isPending: isRanksPending } = useTeamRanks();

  const playerTeam = playerData?.team?.abbreviation;

  const { nextGame, playerRanks, opponentRanks } = useMemo(() => {
    return getMatchupData(scheduleData, rankData, playerTeam) || {};
  }, [scheduleData, rankData, playerTeam]);

  const displaySeason = opponentRanks?.rank_snapshot?.season_year;

  if (isSchedulePending || isRanksPending) {
    return null;
  };

  if (!nextGame || !opponentRanks || !playerRanks) {
    return null;
  };

  return (
    <div className="mb-2 h-full font-mono">
      <div className="grid grid-cols-1 gap-0.5 sm:gap-4">
        <div className="bg-geodude-900 sm:rounded-md border border-geodude-800 p-4">
          <MatchupHeader shortName={nextGame.shortName} date={nextGame.date} />
          <div className="grid grid-cols-1 gap-4">

            {/* Team Rankings Section */}
            <div className="bg-geodude-950 border border-geodude-800 rounded-xl p-2 flex flex-col">
              <p className="text-base font-bold text-foreground mb-2 text-center tracking-wide">
                Team Rankings <span className="text-paper-400 font-normal">({displaySeason})</span>
              </p>

              <div className="grid grid-cols-3 gap-3 items-center border-b border-geodude-800 pb-4 mb-4">
                <TeamSideSelector
                  abbreviation={playerRanks.abbreviation}
                  side={playerSide}
                  setSide={setPlayerSide}
                />
                <span className="text-center text-xs font-black tracking-widest text-paper-500 mt-4">VS</span>
                <TeamSideSelector
                  abbreviation={opponentRanks.abbreviation}
                  side={opponentSide}
                  setSide={setOpponentSide}
                  isOpponent
                />
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <StatRow
                  label="Pass Yds"
                  playerVal={playerRanks.rank_snapshot?.[`${playerSide}_pass_yards_rank`]}
                  opponentVal={opponentRanks.rank_snapshot?.[`${opponentSide}_pass_yards_rank`]}
                />
                <StatRow
                  label="Rush Yds"
                  playerVal={playerRanks.rank_snapshot?.[`${playerSide}_rush_yards_rank`]}
                  opponentVal={opponentRanks.rank_snapshot?.[`${opponentSide}_rush_yards_rank`]}
                />
                <StatRow
                  label="Pass EPA"
                  playerVal={playerSide === "off"
                    ? playerRanks.rank_snapshot?.off_expected_points_added_per_pass_rank
                    : playerRanks.rank_snapshot?.def_expected_points_added_allowed_per_pass_rank}
                  opponentVal={opponentSide === "off"
                    ? opponentRanks.rank_snapshot?.off_expected_points_added_per_pass_rank
                    : opponentRanks.rank_snapshot?.def_expected_points_added_allowed_per_pass_rank}
                />
                <StatRow
                  label="Rush EPA"
                  playerVal={playerSide === "off"
                    ? playerRanks.rank_snapshot?.off_expected_points_added_per_rush_rank
                    : playerRanks.rank_snapshot?.def_expected_points_added_allowed_per_rush_rank}
                  opponentVal={opponentSide === "off"
                    ? opponentRanks.rank_snapshot?.off_expected_points_added_per_rush_rank
                    : opponentRanks.rank_snapshot?.def_expected_points_added_allowed_per_rush_rank}
                />
              </div>
            </div>

            {/* Play Calling Rate Section */}
            <div className="flex flex-col">
              <div className="bg-geodude-950 border border-geodude-800 rounded-xl p-2">
                <p className="text-base font-bold text-foreground mb-4 text-center tracking-wide">
                  Play Calling Rate <span className="text-paper-400 font-normal">({displaySeason})</span>
                </p>

                <div className="flex justify-between ">
                  <TeamSchemes
                    abbreviation={playerRanks.abbreviation}
                    side={playerSide}
                    ranks={playerRanks.rank_snapshot}
                  />
                  <TeamSchemes
                    abbreviation={opponentRanks.abbreviation}
                    side={opponentSide}
                    ranks={opponentRanks.rank_snapshot}
                    isOpponent
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-geodude-900 p-4 h-full sm:rounded-md border border-geodude-800 flex flex-col">
          <YardsAllowedPosition
            playerAbbreviation={playerRanks?.abbreviation}
            opponentAbbreviation={opponentRanks?.abbreviation}
            playerRanks={playerRanks?.rank_snapshot}
            opponentRanks={opponentRanks?.rank_snapshot}
            displaySeason={displaySeason}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(UpcomingMatchup);