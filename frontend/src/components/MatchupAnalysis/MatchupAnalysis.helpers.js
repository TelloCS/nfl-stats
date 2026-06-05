import { PositionStatMap, TeamRankingStatMap } from "../Config"

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

export const getFilteredTeamRankingStatMap = (config, rankingData, team) => {
    if (!rankingData) return [];

    const teamData = Array.isArray(rankingData)
        ? rankingData.find(t => t.full_name === team || t.abbreviation === team)
        : rankingData?.[team];

    const snapshot = teamData?.rank_snapshot;
    const activeSnapshot = snapshot || rankingData[0]?.rank_snapshot;

    if (!activeSnapshot) return [];

    return config.map(category => ({
        ...category,
        stats: category.stats.filter(
            stat => Object.hasOwn(activeSnapshot, stat.key))
    })).filter(category => category.stats.length > 0);
};

export const getGameOptions = (games) => {
    if (!games) return [];

    return games.map((stat, index) => ({
        value: index,
        label: `Week ${stat.game.week} - ${stat.game.short_name}`
    }));
}

export const formatOrdinal = (num) => {
    if (num === undefined || num === null || num === "") return "--";
    const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
    const rule = pr.select(num);
    const suffix = rule === "one" ? "st" : rule === "two" ? "nd" : rule === "few" ? "rd" : "th";
    return `${num}${suffix}`;
};