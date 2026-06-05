import { memo } from "react";
import { getRankBadgeClass } from "./UpcomingMatchup.helpers";
import { formatOrdinal } from "../MatchupAnalysis/MatchupAnalysis.helpers";

const StatRow = memo(({ label, playerVal, opponentVal }) => (
  <div className="grid grid-cols-3 text-center items-center p-1.5 hover:bg-geodude-800 rounded-lg transition-colors duration-150">
    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium mx-auto ${getRankBadgeClass(playerVal)}`}>
      {formatOrdinal(playerVal) || '--'}
    </span>
    <span className="text-sm text-foreground font-semibold tracking-tight">{label}</span>
    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium mx-auto ${getRankBadgeClass(opponentVal)}`}>
      {formatOrdinal(opponentVal) || '--'}
    </span>
  </div>
));


export default memo(StatRow);