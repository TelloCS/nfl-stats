import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Dot } from 'lucide-react';
import { PositionStatMap } from "./Config";
import StatToggle from "./ui/StatToggle";
import CustomizedAxisTick from "./charts/CustomizedAxisTick";

export default function PlayerPerformanceSection({ data }) {
  const [activeStat, setActiveStat] = useState("");

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

  if (!data) return null;

  return (
    <div className="bg-neutral-900 p-4 sm:p-6 rounded-md border border-neutral-800 h-[550px] flex flex-col">
      <div className="font-semibold mb-4 text-neutral-400 flex justify-between items-center h-[39px]">
        <div>
          <div className="text-lg flex text-white items-center gap-1">
            {data.fullName} <Dot className="text-white" /> {activeStatLabel}
          </div>
          <div className="text-sm font-normal flex items-center gap-1">
            {data.team?.full_name} <Dot /> #{data.jersey} <Dot /> {data.position}
          </div>
        </div>
      </div>

      <StatToggle
        options={availableStats}
        activeKey={currentStatKey}
        onSelect={setActiveStat}
      />

      <div className="flex-1 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 36, right: 0, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
            <XAxis
              dataKey="game.date"
              tick={<CustomizedAxisTick stats={chartData} />}
              interval="preserveStartEnd"
              minTickGap={15}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: '#a1a1a1' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              cursor={{ fill: '#262626' }}
              contentStyle={{ backgroundColor: '#171717', borderRadius: '8px', border: '1px solid #252525', color: '#a1a1a1' }}
            />
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
                style={{ fill: '#a1a1a1', fontSize: '12px', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}