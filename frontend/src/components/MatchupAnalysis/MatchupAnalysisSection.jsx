import { memo, useState, useMemo, useEffect, useRef } from "react";
import { TeamRankingStatMap } from "../Config";
import { getMatchupTeams, generateRadarData, getFilteredTeamRankingStatMap, getGameOptions } from "./MatchupAnalysis.helpers";
import Table from "./Table";
import StatToggle from "../StatToggle";
import SelectDropdown from "../SelectDropdown";

function MatchupAnalysisSection({ data, rankingData }) {
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
    <div className="bg-geodude-900 col-span-2 p-4 sm:p-6 sm:rounded-md sm:border sm:border-geodude-800">
      <div className="flex flex-col sm:flex-row sm:items-center text-paper-400 justify-between mb-4 gap-4">
        <div className="min-w-0">
          <span className="font-semibold text-foreground text-lg">Previous Matchups</span>
        </div>

        <SelectDropdown
          value={selectedGameIndex}
          onChange={setSelectedGameIndex}
          options={gameOptions}
          minWidth="120px"
        />
      </div>
      <div className="w-full">
        <StatToggle
          options={availableStats}
          activeKey={activeTabKey}
          onSelect={setActiveTabKey}
        />
        <div className="font-mono">
          <Table
            data={radarData}
            teamOne={teamOne}
            teamTwo={teamTwo}
            statLabel={statLabel}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(MatchupAnalysisSection);