import { memo } from "react";

const GameCard = ({ event }) => {
  const competition = event.competitions?.[0] || {};
  const competitors = competition.competitors || [];

  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");

  const status = event.status?.type?.name;
  const isCompleted = event.status?.type?.completed;
  const isUpcoming = status === "STATUS_SCHEDULED";

  const venue = competition.venue || {};
  const gameOdds = competition.odds?.[0] || null;

  const gameDate = new Date(event?.date);

  const dateLabel = gameDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  const timeLabel = gameDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const checkIsWinner = (team) => {
    return isCompleted && team?.winner
  };

  return (
    <div className="flex-none w-[259px] font-poppins">
      <div className="bg-geodude-900 border border-geodude-800 rounded-lg p-4 hover:border-geodude-700 transition-all duration-200">

        <div className="flex justify-between items-center mb-3 pb-2 border-b border-geodude-800 text-xs uppercase tracking-widest">
          <span className="text-paper-400">
            {dateLabel} {venue.indoor && <span className="text-primary-400 ml-1">(Dome)</span>}
          </span>
          <span className={`font-semibold ${isCompleted ? "text-paper-500" : "text-accent"}`}>
            {isUpcoming ? timeLabel : event.status?.type?.detail}
          </span>
        </div>

        <div className="flex flex-col gap-1 relative">
          <TeamRow
            team={away}
            isWinner={checkIsWinner(away)}
            isUpcoming={isUpcoming}
          />
          <TeamRow
            team={home}
            isWinner={checkIsWinner(home)}
            isUpcoming={isUpcoming}
          />
        </div>

        {isUpcoming && gameOdds && (
          <div className="mt-2 pt-2 border-t border-geodude-800 flex justify-between text-xs text-paper-400 font-mono">
            <span>Line: <span className="text-paper-200">{gameOdds.details || "N/A"}</span></span>
            <span>O/U: <span className="text-paper-200">{gameOdds.overUnder || "N/A"}</span></span>
          </div>
        )}

      </div>
    </div>
  );
};

const TeamRow = memo(({ team, isWinner, isUpcoming }) => (
  <div className="flex items-center justify-between w-full py-1 text-sm">
    <span className={`font-medium truncate ${isWinner ? "text-foreground" : "text-paper-300"}`}>
      {team?.team?.displayName}
    </span>

    {!isUpcoming && (
      <span className={`font-mono ${isWinner ? "text-primary font-bold" : "text-paper-500"}`}>
        {team?.score || "0"}
      </span>
    )}
  </div>
));

export default memo(GameCard);