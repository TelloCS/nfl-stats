import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TeamYearlyChart = memo(({
  teamRanks,
  currentStatKey,
  activeStatLabel,
}) => {
  return (
    <div className="flex-1 min-h-0 mt-2">
      <ResponsiveContainer width="100%" height={290} debounce={100}>
        <LineChart
          data={teamRanks}
          margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
          syncId="teamRankPerfSync"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-geodude-800)" />

          <XAxis
            dataKey="season_year"
            interval="preserveStartEnd"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--app-paper-400)', fontSize: 12 }}
            height={30}
          />

          <YAxis
            domain={[1, 32]}
            tick={{ fontSize: 11, fill: 'var(--app-paper-400)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />

          <Tooltip
            cursor={{ stroke: "var(--app-geodude-800)", strokeWidth: 2 }}
            contentStyle={{ backgroundColor: 'var(--app-geodude-900)', border: '1px solid var(--app-geodude-800)', borderRadius: '8px' }}
            formatter={(value) => [`Rank: ${value}`]}
            labelStyle={{ color: 'var(--app-paper-400)', fontWeight: 'bold', marginBottom: '4px' }}
          />

          <Line
            type="monotone"
            dataKey={currentStatKey}
            name={activeStatLabel}
            stroke="var(--app-primary"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--app-primary", strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: "var(--app-paper-400)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
});