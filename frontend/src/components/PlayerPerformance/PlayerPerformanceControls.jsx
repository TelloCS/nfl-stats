import React from "react";
import Toggle from "./Toggle";
import SelectDropdown from "../SelectDropdown";
import { SCORING_FORMATS } from "../FantasyRankings/FantasyRankings.helpers";

export default function PlayerPerformanceControls({ state, options, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:items-end w-full sm:w-auto">
      {state.activeTab === "gamelogs" && (
        <>
          <div className="flex bg-geodude-900 h-[32px] p-1 border border-geodude-800 rounded-full gap-1 w-full sm:w-fit shrink-0">
            <Toggle
              active={state.viewMode === "table"}
              onClick={() => actions.setViewMode("table")}
              label="Table"
            />
            <Toggle
              active={state.viewMode === "chart"}
              onClick={() => actions.setViewMode("chart")}
              label="Chart"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <SelectDropdown
                value={state.currentSeason}
                onChange={actions.handleSeasonChange}
                options={options.seasonOptions}
                minWidth="120px"
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <SelectDropdown
                value={state.currentSeasonType}
                onChange={actions.handleSeasonTypeChange}
                options={options.seasonTypeOptions}
                minWidth="140px"
              />
            </div>
          </div>
        </>
      )}

      {state.activeTab === "career" && (
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <SelectDropdown
              value={state.currentFormat.label}
              onChange={actions.handleFormatChange}
              options={Object.values(SCORING_FORMATS)}
              minWidth="120px"
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <SelectDropdown
              value={state.careerSeasonType}
              onChange={actions.setCareerSeasonType}
              options={options.seasonTypeOptions}
              minWidth="140px"
            />
          </div>
        </div>
      )}

      {state.activeTab === "matchup" && (
        <div className="w-full sm:w-auto">
          <SelectDropdown
            value={state.matchupSeasonType}
            onChange={actions.setMatchupSeasonType}
            options={options.seasonTypeOptions}
            minWidth="140px"
          />
        </div>
      )}

    </div>
  );
}