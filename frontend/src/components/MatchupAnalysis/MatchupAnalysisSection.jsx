import { memo, useState, useMemo, useEffect, useRef } from "react";
import { TeamRankingStatMap } from "../Config";
import { getMatchupTeams, generateRadarData, getFilteredTeamRankingStatMap, getGameOptions } from "./MatchupAnalysis.helpers";
import Table from "./Table";
import StatToggle from "../StatToggle";
import TableChartButton from "./TableChartButton";
import MatchupRadarChart from "./MatchupRadarChart";

function MatchupAnalysisSection({ data, rankingData }) {
  const [viewMode, setViewMode] = useState("table");
  const games = data?.stats;

  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  const { teamOne, teamTwo } = useMemo(() => getMatchupTeams(games?.[selectedGameIndex]),
    [games, selectedGameIndex]
  );

  const availableStats = useMemo(() => getFilteredTeamRankingStatMap(TeamRankingStatMap, rankingData, teamOne),
    [rankingData, teamOne]
  );

  const [activeTabKey, setActiveTabKey] = useState(availableStats[0]?.key);

  const isInitialized = useRef(false);

  useEffect(() => {
    const isValidTabKey = availableStats.some(s => s.key === activeTabKey);

    if (!isValidTabKey && availableStats.length > 0) {
      setActiveTabKey(availableStats[0].key);
      isInitialized.current = true;
    }
  }, [availableStats, activeTabKey]);

  const radarData = useMemo(() => generateRadarData(activeTabKey, rankingData, teamOne, teamTwo),
    [activeTabKey, rankingData, teamOne, teamTwo]
  );

  const gameOptions = useMemo(() => getGameOptions(games),
    [games]
  );

  const statLabel = TeamRankingStatMap.find(stat => stat.key === activeTabKey)?.label;

  if (!games || games.length === 0) return null;

  return (
    <div className="bg-geodude-900 lg:col-span-1 p-4 sm:p-6 sm:rounded-md border-t sm:border border-geodude-800">
      <TableChartButton 
        selectedGameIndex={selectedGameIndex}
        setSelectedGameIndex={setSelectedGameIndex}
        gameOptions={gameOptions}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="w-full">
        <StatToggle
          options={availableStats}
          activeKey={activeTabKey}
          onSelect={setActiveTabKey}
        />
        <div className="font-mono mt-8">
          {viewMode === "table" ? (
            <Table
              data={radarData}
              teamOne={teamOne}
              teamTwo={teamTwo}
              statLabel={statLabel}
            />
          ) : (
            <MatchupRadarChart
              radarData={radarData}
              teamOne={teamOne}
              teamTwo={teamTwo}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(MatchupAnalysisSection);