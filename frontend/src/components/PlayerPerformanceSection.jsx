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
  console.log(currentSeason)
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
    data?.position ? (PositionStatMap[data?.position] || []) : [],
    [data?.position]
  );

  const currentStatKey = activeStat || (availableStats[0]?.key ?? "");
  const activeStatLabel = availableStats.find(s => s.key === currentStatKey)?.label;

  const chartData = useMemo(() => {
    if (!data?.stats) return [];

    return data?.stats;
  }, [data?.stats]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');

    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isFreeAgent = !data?.team || data?.team === "FA" || data?.team?.full_name === "Free Agent";

  return (
    <div className="bg-geodude-900 h-full p-4 sm:p-6 rounded-md border border-geodude-800 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center text-paper-400 justify-between mb-4 gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-lg sm:text-xl flex text-foreground items-center">
            {data?.fullName} <Dot className="text-foreground" /> {activeStatLabel}
          </div>
          <div className="text-sm font-normal flex items-center gap-1.5">
            {isFreeAgent ? (
              <>
                <span>{data?.position}</span>
              </>
            ) : (
              <>
                {data?.team?.full_name} <Dot /> #{data?.jersey} <Dot /> {data?.position}
              </>
            )}
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

      {data?.stats?.length > 0 ? (
        <>
          <StatToggle
            options={availableStats}
            activeKey={currentStatKey}
            onSelect={setActiveStat}
          />

          <div className="flex-1 min-h-0 mt-2">
            <ResponsiveContainer width="100%" height="350">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-geodude-800)" />
                <XAxis
                  dataKey="game.date"
                  tick={isMobile ? false : <CustomizedAxisTick stats={chartData} />}
                  interval={isMobile ? "preserveStartEnd" : 0}
                  axisLine={false}
                  tickLine={false}
                  height={isMobile ? 0 : 30}
                />
                <YAxis tick={{ fontSize: 12, fill: 'var(--app-paper-400)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--app-geodude-800)" }} />
                <Bar
                  dataKey={currentStatKey}
                  fill="var(--app-primary)"
                  radius={[5, 5, 0, 0]}
                  name={activeStatLabel}
                  maxBarSize={80}
                >
                  <LabelList
                    dataKey={currentStatKey}
                    position="top"
                    style={{ fill: 'var(--app-paper-400)', fontSize: '10px', fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 bg-geodude-900 border border-geodude-800 rounded-lg">
            <p className="text-paper-400 text-sm text-center">
              <span className="text-status-aware font-semibold">Note:</span> {data?.fullName} has no stats for this query.
            </p>
          </div>
        </>
      )}
    </div >
  );
}