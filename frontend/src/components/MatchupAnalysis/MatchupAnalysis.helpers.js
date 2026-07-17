import { PositionStatMap, TeamRankingStatMap } from "../Config"

export const getMatchupTeams = (selectedGameLog) => {
    const teamOne = selectedGameLog?.game?.homeTeam?.abbreviation || "";
    const teamTwo = selectedGameLog?.game?.awayTeam?.abbreviation || "";

    return { teamOne, teamTwo };
};

export const generateRadarData = (activeTabKey, rankingData, teamOne, teamTwo) => {
    const activeCategory = TeamRankingStatMap.find(tab => tab.key === activeTabKey);

    if (!activeCategory || !rankingData || !teamOne || !teamTwo) return [];

    // 1. Normalize rankingData to handle potential DRF pagination results
    const normalizedData = Array.isArray(rankingData)
        ? rankingData
        : (rankingData.results || []);

    if (normalizedData.length === 0) return [];

    // 2. Safely find the teams using the nested 'team' object and case-insensitive matching
    const safeTeamOne = String(teamOne).toUpperCase();
    const safeTeamTwo = String(teamTwo).toUpperCase();

    const teamOneStats = normalizedData.find(
        t => t?.team?.abbreviation?.toUpperCase() === safeTeamOne
    );
    const teamTwoStats = normalizedData.find(
        t => t?.team?.abbreviation?.toUpperCase() === safeTeamTwo
    );

    // 3. Handle data shape variations 
    // (Checks if stats are in a nested 'rank_snapshot' object or flat on the root object)
    const teamOneSnapshot = teamOneStats?.rank_snapshot || teamOneStats;
    const teamTwoSnapshot = teamTwoStats?.rank_snapshot || teamTwoStats;

    // 4. Map the radar data, defaulting to 32 if a stat is missing
    return activeCategory.stats.map((stat) => ({
        subject: stat.label,
        [teamOne]: teamOneSnapshot?.[stat.key] || 32,
        [teamTwo]: teamTwoSnapshot?.[stat.key] || 32,
    }));
};

export const getFilteredTeamRankingStatMap = (config, rankingData, team) => {
    if (!rankingData) return [];

    const normalizedData = Array.isArray(rankingData)
        ? rankingData
        : (rankingData.results || []);

    if (normalizedData.length === 0) return [];
    const safeTeamQuery = String(team || "").toUpperCase();

    const teamData = normalizedData.find(
        t => t?.team?.abbreviation?.toUpperCase() === safeTeamQuery
    );

    const snapshot = teamData?.rank_snapshot;
    const activeSnapshot = snapshot || normalizedData[0]?.rank_snapshot || normalizedData[0];

    if (!activeSnapshot) return [];

    return config.map(category => ({
        ...category,
        stats: category.stats.filter(stat => {
            const value = activeSnapshot[stat.key];
            return Object.hasOwn(activeSnapshot, stat.key) && 
                   value !== 0 && 
                   value != null; 
        })
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