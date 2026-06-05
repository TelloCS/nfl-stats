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

    if (rankNum <= 10) return `${baseShape} bg-primary/20 text-primary border-primary/20`;
    if (rankNum >= 23) return `${baseShape} bg-status-error/20 text-status-error border-status-error/20`;

    return `${baseShape} bg-status-aware/20 text-status-aware border-status-aware/20`;
};