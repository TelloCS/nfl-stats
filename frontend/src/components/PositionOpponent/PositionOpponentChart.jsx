import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomTooltip from '../CustomTooltip';
import CustomizedAxisTick from '../CustomizedAxisTick';
import StatToggle from '../StatToggle';

const LINE_COLORS = [
  'var(--color-status-info)',
  'var(--color-status-success)',
  'var(--color-status-accent)',
  'var(--color-status-aware)',
  'var(--color-status-error)',
];

const PositionOpponentChart = ({
  mergedWeeklyData,
  activeStats,
  statsToShow,
  activeKeys,
  onToggleStat,
  isMobile,
  filters,
  seasonType
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-2'>

      {/* Chart Section */}
      <div className="bg-geodude-900 h-full p-4 sm:p-6 rounded-md border border-geodude-800 flex flex-col lg:col-span-2">
        <div className="flex flex-col text-paper-400 justify-between mb-4">
          <div className="font-semibold text-lg sm:text-xl flex text-foreground items-center">
            {filters?.position}'s vs {filters?.opponent} during the {filters?.season_year} {seasonType}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {activeStats.map((stat, i) => (
              <div key={stat.key} className="flex items-center gap-1.5">
                <div className="w-2 h-2" style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }} />
                <span className="text-xs font-bold text-paper-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <StatToggle options={statsToShow} activeKeys={activeKeys} onSelect={onToggleStat} />

        <div className="flex-1 min-h-0 mt-2">
          <ResponsiveContainer width="100%" height="350" debounce={150}>
            <AreaChart
              data={mergedWeeklyData}
              syncId="nflTrendsSync"
              margin={{ top: 20, right: 20, left: -20, bottom: isMobile ? 20 : 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-geodude-800)" />
              <XAxis
                dataKey="game.date"
                tick={isMobile ? false : <CustomizedAxisTick stats={mergedWeeklyData} />}
                axisLine={false}
                tickLine={false}
                height={isMobile ? 0 : 30}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--app-paper-400)', fontSize: 11 }}
              />
              <Tooltip
                content={<CustomTooltip showStatPrefixes={true} />}
                useTranslate3d={true}
                isAnimationActive={false}
              />

              {activeStats.map((stat, i) => (
                <Area
                  key={stat.key}
                  type="monotone"
                  dataKey={stat.key}
                  name={stat.label}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  fill={LINE_COLORS[i % LINE_COLORS.length]}
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Stat Card Sidebar */}
      <div className="bg-geodude-900 h-full max-h-[542px] p-2 rounded-md border border-geodude-800 flex flex-col">
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-foreground">
          {mergedWeeklyData.map((data) => (
            <div key={data.week} className="p-3 rounded-xl border border-geodude-800 bg-geodude-950/40 font-mono">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-geodude-800/50">
                <span className="text-sm text-paper-400">
                  {data.game.short_name} | {data.game.date}
                </span>
                <span className="text-sm text-paper-400">{data.team?.full_name}</span>
              </div>

              <div className="space-y-3">
                {data.contributors?.map((player, pIdx) => (
                  <div key={pIdx} className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-paper-400">{player.name}</span>
                    <div className="grid grid-cols-3 gap-1">
                      {activeStats.map((stat) => (
                        <div key={stat.key} className="flex justify-between items-center bg-geodude-900 px-2 py-1 rounded border border-geodude-800">
                          <span className="text-xs text-foreground">{stat.label}</span>
                          <span className="text-xs font-bold text-foreground">{player[stat.key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PositionOpponentChart);