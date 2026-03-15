import { PositionStatMap, TeamRankingStatMap } from "../components/Config";

export const getAvailableStats = (position) => {
    return position ? (PositionStatMap[position] || []) : [];
};

export const getStatDetails = (availableStats, activeStatKey) => {
    const currentStatKey = activeStatKey || (availableStats[0]?.key ?? "");
    const activeStatLabel = availableStats.find(s => s.key === currentStatKey)?.label || "";

    return { currentStatKey, activeStatLabel };
};

export const getMatchupTeams = (selectedGameLog) => {
    const teamOne = selectedGameLog?.game?.homeTeam?.abbreviation || "";
    const teamTwo = selectedGameLog?.game?.awayTeam?.abbreviation || "";

    return { teamOne, teamTwo };
};

export const generateRadarData = (activeTabKey, rankingData, teamOne, teamTwo) => {
    const activeCategory = TeamRankingStatMap.find(tab => tab.key === activeTabKey);

    if (!activeCategory || !rankingData || !teamOne || !teamTwo) return [];

    const teamOneStats = rankingData.find(t => t.abbreviation === teamOne);
    const teamTwoStats = rankingData.find(t => t.abbreviation === teamTwo);

    return activeCategory.stats.map((stat) => ({
        subject: stat.label,
        [teamOne]: teamOneStats?.rank_snapshot?.[stat.key] || 32,
        [teamTwo]: teamTwoStats?.rank_snapshot?.[stat.key] || 32,
    }));
};