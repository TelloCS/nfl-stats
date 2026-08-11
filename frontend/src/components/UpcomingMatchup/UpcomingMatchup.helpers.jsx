export const getRankColorClass = (rank) => {
    if (!rank || isNaN(rank)) return 'text-paper-400';

    const rankNum = parseInt(rank, 10);

    if (rankNum <= 10) return 'text-emerald-400 font-semibold';
    if (rankNum >= 23) return 'text-red-400 font-semibold';

    return 'text-amber-400';
};

export const getRankBadgeClass = (rank) => {
    const baseShape = 'w-12 inline-flex justify-center items-center text-center';

    if (!rank || isNaN(rank)) return `${baseShape} bg-background text-paper-400`;

    const rankNum = parseInt(rank, 10);

    if (rankNum <= 10) return `${baseShape} bg-primary/20 text-foreground border-primary/20`;
    if (rankNum >= 23) return `${baseShape} bg-status-error/20 text-foreground border-status-error/20`;

    return `${baseShape} bg-status-aware/20 text-foreground border-status-aware/20`;
};

export const getMatchupData = (scheduleData, rankData, playerTeam) => {
    if (!scheduleData?.events || !rankData || !playerTeam) return null;

    const nextGame = scheduleData.events.find((event) =>
        event.competitions?.[0]?.competitors?.some((c) => c.team?.abbreviation === playerTeam)
    );

    if (!nextGame) return null;

    const competitors = nextGame.competitions[0].competitors;
    const opponent = competitors.find((c) => c.team?.abbreviation !== playerTeam);
    const opponentAbbreviation = opponent?.team?.abbreviation;

    const normalizedData = Array.isArray(rankData)
        ? rankData
        : (rankData.results || []);

    const safePlayerTeamQuery = String(playerTeam || "").toUpperCase();
    const safeOpponentTeamQuery = String(opponentAbbreviation || "").toUpperCase();

    return {
        nextGame,
        playerRanks: normalizedData.find(t => t?.team?.abbreviation?.toUpperCase() === safePlayerTeamQuery),
        opponentRanks: normalizedData.find(t => t?.team?.abbreviation?.toUpperCase() === safeOpponentTeamQuery)
    };
};