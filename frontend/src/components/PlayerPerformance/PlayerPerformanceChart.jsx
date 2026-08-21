import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import CustomizedAxisTick from "../CustomizedAxisTick";
import CustomTooltip from "../CustomTooltip";

const PlayerPerformanceChart = ({
  activeStatLabel,
  currentStatKey,
  chartData,
  isMobile,
}) => {
  return (
    <div className="flex-1 min-h-0 mt-2">
      <ResponsiveContainer width="100%" height="290" debounce={100}>
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
            isAnimationActive={false}
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
  );
};

export default memo(PlayerPerformanceChart);