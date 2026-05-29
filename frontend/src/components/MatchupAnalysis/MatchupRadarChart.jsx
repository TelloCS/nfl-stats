import { memo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import StatToggle from "../StatToggle";
import SelectDropdown from "../SelectDropdown";

const MatchupRadarChart = ({
  selectedGameIndex,
  setSelectedGameIndex,
  gameOptions,
  availableStats,
  activeTabKey,
  setActiveTabKey,
  radarData,
  teamOne,
  teamTwo
}) => {
  return (
    <div className="bg-geodude-900 h-full rounded-md border border-geodude-800 flex flex-col">
      <div className="pt-6 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center text-paper-400 justify-between mb-4 gap-4">
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-lg">Matchups</span>
          </div>

          <SelectDropdown
            value={selectedGameIndex}
            onChange={setSelectedGameIndex}
            options={gameOptions}
            minWidth="120px"
          />
        </div>

        <StatToggle
          options={availableStats}
          activeKey={activeTabKey}
          onSelect={setActiveTabKey}
        />
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="350">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
    </div>
  );
}


export default memo(MatchupRadarChart);