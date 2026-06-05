import { memo, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { TeamRankingStatMap } from "../Config";

function YardsAllowedPositionChart({ playerAbbreviation, playerRanks, opponentAbbreviation, opponentRanks }) {
  const radarData = useMemo(() => {
    const positionMetrics = TeamRankingStatMap.find(
      (group) => group.key === "team_coverage_stats_by_position"
    )?.stats || [];

    return positionMetrics.map(({ key, label }) => {
      const playerRank = parseInt(playerRanks?.[key], 10) || 32;
      const opponentRank = parseInt(opponentRanks?.[key], 10) || 32;

      return {
        subject: label.replace('Yards Allowed', '').trim(),
        [playerAbbreviation]: playerRank,
        [opponentAbbreviation]: opponentRank
      };
    });
  }, [playerRanks, opponentRanks, playerAbbreviation, opponentAbbreviation]);

  if (!playerAbbreviation || !opponentAbbreviation) return null;

  return (
      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="260">
          <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
            <PolarGrid stroke="var(--app-paper-400)" opacity={0.3} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--app-paper-400)' }}
            />
            <PolarRadiusAxis angle={30} domain={[32, 1]} tick={false} axisLine={false} />
            <Radar
              name={playerAbbreviation}
              dataKey={playerAbbreviation}
              stroke="var(--app-secondary)"
              fill="var(--app-secondary)"
              fillOpacity={0.5}
              isAnimationActive={false}
            />
            <Radar
              name={opponentAbbreviation}
              dataKey={opponentAbbreviation}
              stroke="var(--app-paper-400)"
              fill="var(--app-paper-400)"
              fillOpacity={0.3}
              isAnimationActive={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--app-geodude-800)' }}
              contentStyle={{
                backgroundColor: 'var(--app-geodude-900)',
                borderRadius: '8px',
                border: '1px solid var(--app-geodude-800)',
                color: 'var(--app-paper-400)'
              }}
              isAnimationActive={false}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingTop: '10px', color: 'var(--app-paper-400)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
  );
};

export default memo(YardsAllowedPositionChart);