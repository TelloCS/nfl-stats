import { memo, useState, useMemo } from "react";
import { TeamRankingStatMap } from "../Config";
import StatRow from "./StatRow";
import YardsAllowedPositionChart from "./YardsAllowedPositionChart";

const YardsAllowedPosition = memo(({ playerAbbreviation, opponentAbbreviation, playerRanks, opponentRanks, displaySeason }) => {
  const [viewMode, setViewMode] = useState("table");

  const positionMetrics = useMemo(() => {
    return TeamRankingStatMap.find(
      (group) => group.key === "team_coverage_stats_by_position"
    )?.stats || [];
  }, []);

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="text-base font-bold text-foreground mb-2 text-center tracking-wide">
          Yds. Allowed Pos. <span className="text-paper-400 font-normal">({displaySeason})</span>
        </div>

        <div className="flex bg-geodude-900 p-1 max-w-[160px] w-full rounded-full border border-geodude-800 mb-2 shrink-0 gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${viewMode === "table"
              ? "bg-geodude-700 text-foreground"
              : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
              }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${viewMode === "chart"
              ? "bg-geodude-700 text-foreground"
              : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
              }`}
          >
            Chart
          </button>
        </div>
      </div>
      <div className="flex flex-col h-[260px] w-full">
        {viewMode === "table" ? (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 text-center items-center p-1.5 border-b border-geodude-800 mb-3">
              <span className="text-primary font-bold text-base">{playerAbbreviation}</span>
              <span className="text-xs font-black tracking-widest text-paper-500 uppercase">vs</span>
              <span className="text-status-error font-bold text-base">{opponentAbbreviation}</span>
            </div>
            {positionMetrics.map(({ key, label }) => (
              <StatRow
                key={key}
                label={label}
                playerVal={playerRanks?.[key] || '--'}
                opponentVal={opponentRanks?.[key] || '--'}
              />
            ))}
          </div>
        ) : (
          <YardsAllowedPositionChart
            positionMetrics={positionMetrics}
            playerAbbreviation={playerAbbreviation}
            playerRanks={playerRanks}
            opponentAbbreviation={opponentAbbreviation}
            opponentRanks={opponentRanks}
          />
        )}
      </div>
    </>
  );
});

export default memo(YardsAllowedPosition);