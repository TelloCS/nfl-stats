export const GAME_STATUS = {
  SCHEDULED: "STATUS_SCHEDULED",
  IN_PROGRESS: "STATUS_IN_PROGRESS",
  FINAL: "STATUS_FINAL",
  POSTPONED: "STATUS_POSTPONED",
  CANCELED: "STATUS_CANCELED",
};
 

export function useGameCardData(event) {
  const competition = event?.competitions?.[0] ?? {};
  const competitors = competition.competitors ?? [];

  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");

  const statusName = event?.status?.type?.name;
  const isCompleted = Boolean(event?.status?.type?.completed);
  const isUpcoming = statusName === GAME_STATUS.SCHEDULED;

  const venue = competition.venue ?? {};
  const gameOdds = competition.odds?.[0] ?? null;

  const gameDate = event?.date ? new Date(event.date) : null;
  const isValidDate = gameDate instanceof Date && !Number.isNaN(gameDate.getTime());

  const dateLabel = isValidDate
    ? gameDate.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
    : "TBD";

  const timeLabel = isValidDate
    ? gameDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "TBD";

  const statusLabel = isUpcoming ? timeLabel : event?.status?.type?.detail ?? "";

  return {
    home,
    away,
    isCompleted,
    isUpcoming,
    venue,
    gameOdds,
    dateLabel,
    statusLabel,
    isValidDate,
  };
}

export function isWinningTeam(team, isCompleted) {
  return Boolean(isCompleted && team?.winner);
}