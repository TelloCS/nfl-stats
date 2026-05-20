import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SearchX } from 'lucide-react';
import CustomTooltip from './charts/CustomTooltip';
import CustomizedAxisTick from './charts/CustomizedAxisTick';
import StatToggle from './ui/StatToggle';
import { STAT_TYPES, calculateWeeklyStats } from './StatsAggregator';

const LINE_COLORS = [
  'var(--color-status-info)',
  'var(--color-status-success)',
  'var(--color-status-accent)',
  'var(--color-status-aware)',
  'var(--color-status-error)',
];

const PvOChart = ({ sortedGameLogs = [], statsToShow = [], filters, selectedKeys, onToggleStat }) => {
  const activeKeys = useMemo(() => {
    const availableKeys = statsToShow.map(s => s.key);
    const valid = (selectedKeys || []).filter(key => availableKeys.includes(key));
    return valid.length > 0 ? valid : [statsToShow[0]?.key];
  }, [selectedKeys, statsToShow]);

  const activeStats = useMemo(() =>
    statsToShow.filter(s => activeKeys.includes(s.key)),
    [statsToShow, activeKeys]
  );

  const mergedWeeklyData = useMemo(() => {
    if (!sortedGameLogs?.length || !activeKeys.length) return [];

    const weeklyMap = sortedGameLogs.reduce((acc, log) => {
      const week = log.game?.week;
      if (!week) return acc;

      if (!acc[week]) {
        acc[week] = { ...log, week, contributors: [] };
        STAT_TYPES.VOLUME.forEach(key => acc[week][key] = 0);
        STAT_TYPES.MAX.forEach(key => acc[week][key] = 0);
      }

      const playerStats = { ...log, name: log.player?.fullName };
      activeKeys.forEach(k => {
        const val = log[k] || 0;
        playerStats[k] = typeof val === 'number' ? Number(val.toFixed(2)) : val;
      });
      acc[week].contributors.push(playerStats);

      STAT_TYPES.VOLUME.forEach(key => {
        if (typeof log[key] === 'number') acc[week][key] += log[key];
      });

      return acc;
    }, {});

    return Object.values(weeklyMap)
      .sort((a, b) => a.week - b.week)
      .map(weekData => calculateWeeklyStats(weekData, filters?.position));
  }, [sortedGameLogs, activeKeys, filters?.position]);

  const seasonType = filters?.season_type !== "3" ? "Regular Season" : "Playoffs";

  if (!sortedGameLogs || sortedGameLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 border border-geodude-800 rounded-lg bg-geodude-900 font-mono text-paper-500">
        <SearchX size={32} className="text-geodude-700" />
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-2'>

      {/* Chart Section */}
      <div className="bg-geodude-900 h-full p-4 sm:p-6 rounded-md border border-geodude-800 flex flex-col lg:col-span-2">
        <div className="flex flex-col mb-6">
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
          <ResponsiveContainer width="100%" height="350">
            <AreaChart data={mergedWeeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-geodude-800)" opacity={0.3} />
              <XAxis dataKey="game.date" tick={<CustomizedAxisTick stats={mergedWeeklyData} />} axisLine={false} tickLine={false} height={50} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--app-paper-500)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />

              {activeStats.map((stat, i) => (
                <Area
                  key={stat.key}
                  type="monotone"
                  dataKey={stat.key}
                  name={stat.label?.toUpperCase()}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  fill={LINE_COLORS[i % LINE_COLORS.length]}
                  fillOpacity={0.1}
                  strokeWidth={3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Stat Card Sidebar */}
      <div className="bg-geodude-900 h-full max-h-[550px] p-2 rounded-md border border-geodude-800 flex flex-col overflow-hidden">
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-foreground">
          {mergedWeeklyData.map((data) => (
            <div key={data.week} className="p-3 rounded-xl border border-geodude-800 bg-geodude-950/40">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-geodude-800/50">
                <span className="text-xs font-semibold text-paper-400">
                  {data.game.short_name} | {data.game.date}
                </span>
                <span className="text-xs font-bold text-paper-400">{data.team?.full_name}</span>
              </div>

              <div className="space-y-3">
                {data.contributors?.map((player, pIdx) => (
                  <div key={pIdx} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-paper-400">{player.name}</span>
                    <div className="grid grid-cols-3 gap-1">
                      {activeStats.map((stat) => (
                        <div key={stat.key} className="flex justify-between items-center bg-geodude-900 px-2 py-1 rounded border border-geodude-800">
                          <span className="text-xs text-foreground uppercase">{stat.label}</span>
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

export default PvOChart;