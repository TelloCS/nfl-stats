import { memo, useMemo } from 'react';
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
import CustomTooltip from '../CustomTooltip';
import CustomizedAxisTick from '../CustomizedAxisTick';
import StatToggle from '../StatToggle';
import { calculateWeeklyStats } from './PositionOpponent.helpers';
import { useIsMobile } from '../../hooks/useMediaQueries';
import { STAT_TYPES } from '../Config';
import PositionOpponentChart from './PositionOpponentChart';

const LINE_COLORS = [
  'var(--color-status-info)',
  'var(--color-status-success)',
  'var(--color-status-accent)',
  'var(--color-status-aware)',
  'var(--color-status-error)',
];

const TrendSection = ({ sortedGameLogs = [], statsToShow = [], filters, selectedKeys = [], onToggleStat }) => {
  const isMobile = useIsMobile();

  const activeKeys = useMemo(() => {
    const availableKeys = statsToShow.map(s => s.key);
    const valid = selectedKeys.filter(key => availableKeys.includes(key));
    return valid.length > 0 ? valid : [statsToShow[0]?.key];
  }, [selectedKeys, statsToShow]);

  const activeStats = useMemo(() => {
    const activeSet = new Set(activeKeys);
    return statsToShow.filter(s => activeSet.has(s.key));
  }, [statsToShow, activeKeys]);

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

      const playerStats = { ...log };
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

    const result = Object.values(weeklyMap)
      .sort((a, b) => a.week - b.week)
      .map(weekData => calculateWeeklyStats(weekData, filters?.position));

    return result
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
    <PositionOpponentChart
      mergedWeeklyData={mergedWeeklyData}
      activeStats={activeStats}
      statsToShow={statsToShow}
      activeKeys={activeKeys}
      onToggleStat={onToggleStat}
      isMobile={isMobile}
      filters={filters}
      seasonType={seasonType}
    />
  );
};

export default memo(TrendSection);