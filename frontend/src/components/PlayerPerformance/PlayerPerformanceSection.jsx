import { memo } from "react";
import { useIsMobile } from "../../hooks/useMediaQueries";
import { usePlayerPerformance } from "./usePlayerPerformance";
import PlayerPerformanceChart from "./PlayerPerformanceChart";
import PlayerCareerStats from "./PlayerCareerStats";
import PlayerVsUpcomingMatchup from "../UpcomingMatchup/PlayerVsUpcomingMatchup";
import Table from "./Table";
import Profile from "./Profile";
import StatToggle from "../StatToggle";
import PlayerPerformanceControls from "./PlayerPerformanceControls";

function PlayerPerformanceSection({ data, onFilterChange, filters }) {
  const isMobile = useIsMobile();
  const { state, options, computed, actions } = usePlayerPerformance(data, filters, onFilterChange);

  const getTabClass = (tabName) => `flex-1 text-center py-2 px-1 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${state.activeTab === tabName
      ? "border-foreground text-foreground"
      : "border-transparent text-paper-400 hover:text-foreground hover:border-geodude-700"
    }`;

  return (
    <div className="bg-geodude-900 p-4 sm:p-6 sm:rounded-md sm:border sm:border-geodude-800 flex flex-col">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="flex items-center">
          <Profile data={data} activeStatLabel={state.activeTab === "gamelogs" ? computed.activeStatLabel : ""} />
        </div>

        {/* Complex dynamic dropdown logic moved to its own component */}
        <PlayerPerformanceControls
          state={state}
          options={options}
          actions={actions}
        />
      </div>

      {/* TABS SECTION */}
      <div className="flex w-full border-b border-geodude-800 mb-4">
        <button onClick={() => actions.setActiveTab("gamelogs")} className={getTabClass("gamelogs")}>Game Logs</button>
        <button onClick={() => actions.setActiveTab("career")} className={getTabClass("career")}>Career Stats</button>
        <button onClick={() => actions.setActiveTab("matchup")} className={getTabClass("matchup")}>Upcoming Matchup</button>
      </div>

      {/* CONTENT SECTION */}
      <div className="w-full">
        {state.activeTab === "gamelogs" && (
          state.viewMode === "table" ? (
            <Table data={data} availableStats={options.availableStats} />
          ) : (
            <>
              <div className="mb-4">
                <StatToggle options={options.availableStats} activeKey={computed.currentStatKey} onSelect={actions.setActiveStat} />
              </div>
              <PlayerPerformanceChart activeStatLabel={computed.activeStatLabel} currentStatKey={computed.currentStatKey} chartData={computed.chartData} isMobile={isMobile} />
            </>
          )
        )}
        
        {state.activeTab === "career" && (
          <PlayerCareerStats availableStats={options.availableStats} currentFormat={state.currentFormat} seasonType={state.careerSeasonType} />
        )}

        {state.activeTab === "matchup" && (
          <PlayerVsUpcomingMatchup playerData={data} availableStats={options.availableStats} seasonType={state.matchupSeasonType} />
        )}
      </div>
    </div>
  );
}

export default memo(PlayerPerformanceSection);