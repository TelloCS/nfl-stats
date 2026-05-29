import { memo, useState, useMemo, useCallback } from "react";
import { PositionStatMap, FilterConfig } from "../Config";
import { useIsMobile } from "../../hooks/useMediaQueries";
import PlayerPerformanceChart from "./PlayerPerformanceChart";

const EMPTY_STATS = [];

function PlayerPerformanceSection({ data, onFilterChange, filters }) {
  const [activeStat, setActiveStat] = useState("");
  const isMobile = useIsMobile();

  const currentSeason = filters?.season_year || data?.active_season;
  const seasonOptions = useMemo(() =>
    data?.available_seasons?.map(year => ({
      label: String(year),
      value: String(year)
    })) || EMPTY_STATS,
    [data?.available_seasons]
  );

  const currentSeasonType = filters?.season_type || FilterConfig.season_type[0].value;
  const seasonTypeOptions = FilterConfig.season_type

  const availableStats = useMemo(() =>
    data?.position ? (PositionStatMap[data?.position] || EMPTY_STATS) : EMPTY_STATS,
    [data?.position]
  );

  const currentStatKey = activeStat || (availableStats[0]?.key ?? "");
  const activeStatLabel = availableStats.find(s => s.key === currentStatKey)?.label;
  const chartData = data?.stats || EMPTY_STATS;

  const handleSeasonChange = useCallback((v) => {
    onFilterChange('season_year', v);
  }, [onFilterChange]);

  const handleSeasonTypeChange = useCallback((t) => {
    onFilterChange('season_type', t);
  }, [onFilterChange]);

  const isFreeAgent = !data?.team || data?.team === "FA" || data?.team?.full_name === "Free Agent";

  return (
    <PlayerPerformanceChart
      data={data}
      activeStatLabel={activeStatLabel}
      currentSeason={currentSeason}
      handleSeasonChange={handleSeasonChange}
      seasonOptions={seasonOptions}
      currentSeasonType={currentSeasonType}
      handleSeasonTypeChange={handleSeasonTypeChange}
      seasonTypeOptions={seasonTypeOptions}
      availableStats={availableStats}
      currentStatKey={currentStatKey}
      setActiveStat={setActiveStat}
      chartData={chartData}
      isMobile={isMobile}
      isFreeAgent={isFreeAgent}
    />
  );
};

export default memo(PlayerPerformanceSection);