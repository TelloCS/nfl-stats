import { memo } from "react";
import StatRow from "./StatRow";

const TeamRankingsSection = ({ playerAbbreviation, opponentAbbreviation, playerRanks, playerSide, opponentRanks, opponentSide }) => {
  return (
    <div className="p-1">
      <div className="grid grid-cols-3 border-b border-geodude-800 text-center font-bold p-1.5 mb-3">
        <span className="text-primary font-bold text-base">{playerAbbreviation}</span>
        <span className="text-xs font-black tracking-widest text-paper-500 uppercase">vs</span>
        <span className="text-status-error font-bold text-base">{opponentAbbreviation}</span>
      </div>

      <div className="flex flex-col gap-1">
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
  )
}


export default memo(TeamRankingsSection);