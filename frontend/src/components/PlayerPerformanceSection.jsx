import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Dot } from 'lucide-react';
import { PositionStatMap, FilterConfig } from "./Config";
import StatToggle from "./ui/StatToggle";
import SelectDropdown from "./ui/SelectDropdown";
import CustomizedAxisTick from "./charts/CustomizedAxisTick";
import CustomTooltip from "./charts/CustomTooltip";

export default function PlayerPerformanceSection({ data, onFilterChange, filters }) {
  const [activeStat, setActiveStat] = useState("");

  const currentSeason = filters?.season_year || data?.active_season;
  const seasonOptions = useMemo(() =>
    data?.available_seasons?.map(year => ({
      label: String(year),
      value: String(year)
    })) || [],
    [data?.available_seasons]
  );

  const currentSeasonType = filters?.season_type || FilterConfig.season_type[0].value;
  const seasonTypeOptions = FilterConfig.season_type

  const availableStats = useMemo(() =>
    data?.position ? (PositionStatMap[data.position] || []) : [],
    [data?.position]
  );

  const currentStatKey = activeStat || (availableStats[0]?.key ?? "");
  const activeStatLabel = availableStats.find(s => s.key === currentStatKey)?.label;

  const chartData = useMemo(() => {
    if (!data?.stats) return [];

    const paddedStats = [...data.stats];
    const MIN_GAMES_TO_SHOW = 5;

    while (paddedStats.length > 0 && paddedStats.length < MIN_GAMES_TO_SHOW) {
      paddedStats.push({
        isPlaceholder: true,
        game: { date: `NA` }
      });
    }

    return paddedStats;
  }, [data?.stats]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="bg-neutral-900 p-4 sm:p-6 rounded-md border border-neutral-800 h-[550px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center text-neutral-400 justify-between mb-4 gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-lg sm:text-xl flex text-white items-center">
            {data?.fullName} <Dot className="text-white" /> {activeStatLabel}
          </div>
          <div className="text-sm font-normal flex items-center">
            {data?.team?.full_name} <Dot /> #{data?.jersey} <Dot /> {data?.position}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SelectDropdown
            value={currentSeason}
            onChange={(v) => onFilterChange('season_year', v)}
            options={seasonOptions}
            minWidth="120px"
          />
          <SelectDropdown
            value={currentSeasonType}
            onChange={(t) => onFilterChange('season_type', t)}
            options={seasonTypeOptions}
            minWidth="140px"
          />
        </div>
      </div>

      <StatToggle
        options={availableStats}
        activeKey={currentStatKey}
        onSelect={setActiveStat}
      />

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
            <XAxis
              dataKey="game.date"
              tick={isMobile ? false : <CustomizedAxisTick stats={chartData} />}
              interval={isMobile ? "preserveStartEnd" : 0}
              axisLine={false}
              tickLine={false}
              height={isMobile ? 0 : 30}
            />
            <YAxis tick={{ fontSize: 12, fill: '#a1a1a1' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#262626' }} />
            <Bar
              dataKey={currentStatKey}
              fill="#009966"
              radius={[5, 5, 0, 0]}
              name={activeStatLabel}
              maxBarSize={80}
            >
              <LabelList
                dataKey={currentStatKey}
                position="top"
                style={{ fill: '#a1a1a1', fontSize: '10px', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}