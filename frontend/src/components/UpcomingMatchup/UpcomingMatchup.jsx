import { memo, useState } from "react";
import { TeamRankingStatMap, PositionStatMap } from "../Config";
import StatRow from "./StatRow";
import TeamSchemes from "./TeamSchemes";
import MatchupHeader from "./MatchupHeader";
import TeamRankingsSection from "./TeamRankingsSection";
import YardsAllowedPosition from "./YardsAllowedPosition";
import TeamSideSelector from "./TeamSideSelector";
import PlayerVsUpcomingMatchup from "./PlayerVsUpcomingMatchup";
import useMatchupData from "../../hooks/useMatchupData";

function UpcomingMatchup({ playerData, showMatchup }) {
  const [playerSide, setPlayerSide] = useState("off");
  const [opponentSide, setOpponentSide] = useState("def");

  const playerTeam = playerData?.team?.abbreviation;
  const {
    nextGame,
    playerRanks,
    opponentRanks,
    rankData,
    isSchedulePending,
    isRanksPending
  } = useMatchupData(playerTeam);

  const displaySeason = rankData?.[0]?.season_year;

  if (isSchedulePending || isRanksPending) {
    return null;
  }

  if (!nextGame || !opponentRanks || !playerRanks) {
    return null;
  }

  return (
    <div className="mb-2 h-full font-mono">
      <div className="bg-geodude-900 sm:rounded-md border-t sm:border border-geodude-800 p-4 flex flex-col">
        <div className={`grid grid-cols-1 gap-4 ${!showMatchup ? 'lg:grid-cols-3' : ''}`}>
          <div className={`bg-geodude-950 border-t border-x border-geodude-800 rounded-t-xl grid grid-cols-2 gap-2 items-center p-4 order-2 ${!showMatchup ? 'lg:col-span-2 lg:order-1' : ''}`}>
            <TeamSideSelector
              abbreviation={playerRanks.team?.abbreviation}
              side={playerSide}
              setSide={setPlayerSide}
            />
            <TeamSideSelector
              abbreviation={opponentRanks.team?.abbreviation}
              side={opponentSide}
              setSide={setOpponentSide}
              isOpponent
            />
          </div>
          <MatchupHeader shortName={nextGame.shortName} date={nextGame.date} showMatchup={showMatchup} />
        </div>
        <div className={`grid grid-cols-1 gap-4 ${!showMatchup ? 'lg:grid-cols-3' : ''}`}>
          <div className={`bg-geodude-950 border border-geodude-800 rounded-b-xl p-2 md:p-4 ${!showMatchup ? 'lg:col-span-2' : ''}`}>
            <div className={`grid gap-2 grid-cols-1 ${!showMatchup ? 'md:grid-cols-2' : ''}`}>

              {/* Play Calling Rate Section */}
              <div className={`flex flex-col h-full pb-4 mb-4 ${showMatchup ? 'order-2' : 'order-1'}`}>
                <p className="text-base font-bold text-foreground mb-4 text-center tracking-wide mt-4">
                  Play Calling Rate <span className="text-paper-400 font-normal">({displaySeason})</span>
                </p>

                <div className="flex justify-between items-center">
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
              <div className={`flex flex-col h-full pb-4 mb-4 ${showMatchup ? 'order-1' : 'order-2'}`}>
                <p className="text-base font-bold text-foreground mb-4 text-center tracking-wide mt-4">
                  Team Rankings <span className="text-paper-400 font-normal">({displaySeason})</span>
                </p>
                <TeamRankingsSection
                  playerAbbreviation={playerRanks?.team?.abbreviation}
                  opponentAbbreviation={opponentRanks?.team?.abbreviation}
                  playerRanks={playerRanks}
                  playerSide={playerSide}
                  opponentRanks={opponentRanks}
                  opponentSide={opponentSide}
                />

              </div>
            </div>
          </div>

          {/* Yards Allowed Position Section */}
          <div className={`bg-geodude-950 border border-geodude-800 p-2 md:p-4 h-full rounded-xl flex flex-col justify-center ${!showMatchup ? 'lg:col-span-1' : ''}`}>
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