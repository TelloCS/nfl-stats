import { memo } from "react";
import { Dot } from 'lucide-react';
import SelectDropdown from "../SelectDropdown";
import StatToggle from "../StatToggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import CustomizedAxisTick from "../CustomizedAxisTick";
import CustomTooltip from "../CustomTooltip";

const PlayerPerformanceChart = ({
  data,
  activeStatLabel,
  currentSeason,
  handleSeasonChange,
  seasonOptions,
  currentSeasonType,
  handleSeasonTypeChange,
  seasonTypeOptions,
  availableStats,
  currentStatKey,
  setActiveStat,
  chartData,
  isMobile,
  isFreeAgent
}) => {
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
            onChange={handleSeasonChange}
            options={seasonOptions}
            minWidth="120px"
          />
          <SelectDropdown
            value={currentSeasonType}
            onChange={handleSeasonTypeChange}
            options={seasonTypeOptions}
            minWidth="140px"
          />
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <StatToggle
            options={availableStats}
            activeKey={currentStatKey}
            onSelect={setActiveStat}
          />

          <div className="flex-1 min-h-0 mt-2">
            <ResponsiveContainer width="100%" height="350" debounce={100}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: -20, bottom: isMobile ? 20 : 40 }}
                syncId="playerPerfSync"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-geodude-800)" />
                <XAxis
                  dataKey="game.date"
                  tick={isMobile ? false : <CustomizedAxisTick stats={chartData} />}
                  interval={isMobile ? "preserveStartEnd" : 0}
                  axisLine={false}
                  tickLine={false}
                  height={isMobile ? 0 : 30}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--app-paper-400)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--app-geodude-800)" }}
                  useTranslate3d={true}
                  isAnimationActive={false}
                />
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
};

export default memo(PlayerPerformanceChart);