import { memo, useState, useMemo, useCallback } from "react";
import { PositionStatMap, FilterConfig } from "../Config";
import { useIsMobile } from "../../hooks/useMediaQueries";
import PlayerPerformanceChart from "./PlayerPerformanceChart";
import PlayerCareerStats from "./PlayerCareerStats";
import PlayerVsUpcomingMatchup from "../UpcomingMatchup/PlayerVsUpcomingMatchup";
import Table from "./Table";
import Toggle from "./Toggle";
import Profile from "./Profile";
import StatToggle from "../StatToggle";
import SelectDropdown from "../SelectDropdown";

import {
  EMPTY_STATS,
  getSeasonOptions,
  getAvailableStats,
  getCurrentStatDetails
} from "./PlayerPerformance.helpers";

import { SCORING_FORMATS } from "../FantasyRankings/FantasyRankings.helpers";

function PlayerPerformanceSection({ data, onFilterChange, filters }) {
  const isMobile = useIsMobile();

  const [activeStat, setActiveStat] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("gamelogs");
  const [currentFormat, setCurrentFormat] = useState(SCORING_FORMATS.ppr_points);
  const [matchupSeasonType, setMatchupSeasonType] = useState(FilterConfig.season_type[0].value);
  const [careerSeasonType, setCareerSeasonType] = useState(FilterConfig.season_type[0].value);

  const currentSeason = filters?.season_year || data?.active_season;
  const currentSeasonType = filters?.season_type || FilterConfig.season_type[0].value;
  const seasonTypeOptions = FilterConfig.season_type;
  const chartData = data?.stats || EMPTY_STATS;

  const seasonOptions = useMemo(() =>
    getSeasonOptions(data?.available_seasons),
    [data?.available_seasons]
  );

  const availableStats = useMemo(() =>
    getAvailableStats(data?.position, PositionStatMap),
    [data?.position]
  );

  const { currentStatKey, activeStatLabel } = useMemo(() =>
    getCurrentStatDetails(availableStats, activeStat),
    [availableStats, activeStat]
  );

  const handleSeasonChange = useCallback((v) => {
    onFilterChange('season_year', v);
  }, [onFilterChange]);

  const handleSeasonTypeChange = useCallback((t) => {
    onFilterChange('season_type', t);
  }, [onFilterChange]);

  const handleFormatChange = useCallback((selectedValue) => {
    setCurrentFormat(SCORING_FORMATS[selectedValue]);
  }, []);

  const handleCareerSeasonTypeChange = useCallback((selectedValue) => {
    setCareerSeasonType(selectedValue);
  }, []);

  const handleMatchupSeasonTypeChange = useCallback((selectedValue) => {
    setMatchupSeasonType(selectedValue);
  }, []);

  const getTabClass = (tabName) => `flex-1 text-center py-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeTab === tabName
    ? "border-foreground text-foreground"
    : "border-transparent text-paper-400 hover:text-foreground hover:border-geodude-700"
    }`;

  return (
    <div className="bg-geodude-900 p-4 sm:p-6 sm:rounded-md sm:border sm:border-geodude-800 flex flex-col">
      <div className="grid grid-cols-3 sm:grid-cols-[1fr_auto] gap-4 items-center mb-4">
        <div className="col-span-2 sm:row-span-3 flex items-center">
          <Profile
            data={data}
            activeStatLabel={activeTab === "gamelogs" ? activeStatLabel : ""}
          />
        </div>

        {activeTab === "gamelogs" && (
          <>
            <div className="col-span-1 flex justify-end items-start">
              <Toggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            <div className="col-span-3 sm:col-span-1 sm:col-start-3 flex flex-col sm:flex-row justify-end sm:items-center gap-3">
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
          </>
        )}

        {activeTab === "career" && (
          <div className="col-span-3 sm:col-span-1 sm:col-start-3 flex flex-col sm:flex-row justify-end sm:items-center gap-3">
            <SelectDropdown
              value={currentFormat.label}
              onChange={handleFormatChange}
              options={Object.values(SCORING_FORMATS)}
              minWidth="120px"
            />
            <SelectDropdown
              value={careerSeasonType}
              onChange={handleCareerSeasonTypeChange}
              options={seasonTypeOptions}
              minWidth="140px"
            />
          </div>
        )}

        {activeTab === "matchup" && (
          <div className="col-span-3 sm:col-span-1 sm:col-start-3 flex flex-col sm:flex-row justify-end sm:items-center gap-3">
            <SelectDropdown
              value={matchupSeasonType}
              onChange={handleMatchupSeasonTypeChange}
              options={seasonTypeOptions}
              minWidth="140px"
            />
          </div>
        )}

      </div>

      <div className="flex w-full border-b border-geodude-800 mb-4">
        <button onClick={() => setActiveTab("gamelogs")} className={getTabClass("gamelogs")}>
          Game Logs
        </button>
        <button onClick={() => setActiveTab("career")} className={getTabClass("career")}>
          Career Stats
        </button>
        <button onClick={() => setActiveTab("matchup")} className={getTabClass("matchup")}>
          Upcoming Matchup
        </button>
      </div>

      <div className="w-full">
        {activeTab === "gamelogs" && (
          chartData.length > 0 ? (
            <>
              {viewMode === "table" ? (
                <Table
                  data={data}
                  availableStats={availableStats}
                />
              ) : (
                <>
                  <div className="mb-4">
                    <StatToggle
                      options={availableStats}
                      activeKey={currentStatKey}
                      onSelect={setActiveStat}
                    />
                  </div>
                  <PlayerPerformanceChart
                    activeStatLabel={activeStatLabel}
                    currentStatKey={currentStatKey}
                    chartData={chartData}
                    isMobile={isMobile}
                  />
                </>
              )}
            </>
          ) : (
            <div className="p-4 bg-geodude-900 border border-geodude-800 rounded-lg">
              <p className="text-paper-400 text-sm text-center">
                <span className="text-status-aware font-semibold">Note:</span> {data?.fullName} has no stats for this query.
              </p>
            </div>
          )
        )}

        {activeTab === "career" && (
          <PlayerCareerStats
            availableStats={availableStats}
            currentFormat={currentFormat}
            seasonType={careerSeasonType}
          />
        )}

        {activeTab === "matchup" && (
          <PlayerVsUpcomingMatchup
            playerData={data}
            availableStats={availableStats}
            seasonType={matchupSeasonType}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PlayerPerformanceSection);