import { memo, useState, useMemo, useEffect } from "react";
import { TeamRankingStatMap } from "../Config";
import { getMatchupTeams, generateRadarData, getFilteredTeamRankingStatMap, getGameOptions } from "./MatchupAnalysis.helpers";
import MatchupRadarChart from "./MatchupRadarChart";

function MatchupAnalysisSection({ games, rankingData }) {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  const { teamOne, teamTwo } = useMemo(() => getMatchupTeams(games?.[selectedGameIndex]),
    [games, selectedGameIndex]
  );

  const availableStats = useMemo(() => getFilteredTeamRankingStatMap(TeamRankingStatMap, rankingData, teamOne),
    [rankingData, teamOne]
  );

  const [activeTabKey, setActiveTabKey] = useState(availableStats[0]?.key);

  useEffect(() => {
    const isValidTabKey = availableStats.some(s => s.key === activeTabKey);

    if (!isValidTabKey && availableStats.length > 0) {
      setActiveTabKey(availableStats[0].key);
    }

  }, [availableStats, activeTabKey]);

  const radarData = useMemo(() => generateRadarData(activeTabKey, rankingData, teamOne, teamTwo),
    [activeTabKey, rankingData, teamOne, teamTwo]
  );

  const gameOptions = useMemo(() => getGameOptions(games),
    [games]
  );

  if (!games || games.length === 0) return null;

  return (
    <MatchupRadarChart
      selectedGameIndex={selectedGameIndex}
      setSelectedGameIndex={setSelectedGameIndex}
      gameOptions={gameOptions}
      availableStats={availableStats}
      activeTabKey={activeTabKey}
      setActiveTabKey={setActiveTabKey}
      radarData={radarData}
      teamOne={teamOne}
      teamTwo={teamTwo}
    />
  );
}

export default memo(MatchupAnalysisSection);