import { memo } from "react";
import { getRankBadgeClass } from "./UpcomingMatchup.helpers";
import { formatOrdinal } from "../MatchupAnalysis/MatchupAnalysis.helpers";

const TeamSchemes = memo(({ abbreviation, side, ranks, isOpponent }) => {
  const textColor = isOpponent ? "text-status-error" : "text-primary";
  const isOff = side === "off";

  const schemeStats = isOff ? [
    { label: 'Play Action', val: ranks?.play_action_rate_rank },
    { label: 'No Huddle', val: ranks?.nohuddle_rate_rank },
    { label: 'Shotgun', val: ranks?.shotgun_rate_rank },
    { label: 'Motion', val: ranks?.motion_rate_rank },
  ] : [
    { label: 'Mid. Closed', val: ranks?.middle_closed_rate_rank },
    { label: 'Mid. Open', val: ranks?.middle_open_rate_rank },
    { label: 'Zone', val: ranks?.zone_rate_rank },
    { label: 'Man', val: ranks?.man_rate_rank },
  ];

  return (
    <div className="flex-1 flex flex-col p-1">
      <div className="border-b border-geodude-800 text-center font-bold pb-2 mb-3">
        <span className={`${textColor} tracking-wide`}>{abbreviation}</span>
      </div>

      <div className="flex flex-col gap-1">
        {schemeStats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between hover:bg-geodude-800 rounded-md transition-colors p-1.5">
            <span className="text-foreground font-medium text-xs sm:text-sm">{stat.label}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${getRankBadgeClass(stat.val)}`}>
              {formatOrdinal(stat.val) || '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default memo(TeamSchemes);