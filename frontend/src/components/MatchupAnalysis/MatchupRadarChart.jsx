import { memo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const MatchupRadarChart = ({
  radarData,
  teamOne,
  teamTwo
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <ResponsiveContainer width="100%" height="260">
        <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
          <PolarGrid stroke="var(--app-paper-400)" opacity={0.3} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--app-paper-400)' }}
          />
          <PolarRadiusAxis angle={30} domain={[32, 1]} tick={false} axisLine={false} />
          <Radar
            name={teamOne}
            dataKey={teamOne}
            stroke="var(--app-secondary)"
            fill="var(--app-secondary)"
            fillOpacity={0.5}
            isAnimationActive={false}
          />
          <Radar
            name={teamTwo}
            dataKey={teamTwo}
            stroke="var(--app-paper-400)"
            fill="var(--app-paper-400)"
            fillOpacity={0.3}
            isAnimationActive={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--app-geodude-800)' }}
            contentStyle={{ backgroundColor: 'var(--app-geodude-900)', borderRadius: '8px', border: '1px solid var(--app-geodude-800)', color: 'var(--app-paper-400)' }}
            isAnimationActive={false}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '10px', color: 'var(--app-paper-400)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


export default memo(MatchupRadarChart);