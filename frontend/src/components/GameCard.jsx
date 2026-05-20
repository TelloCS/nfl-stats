export const GameCard = ({ event }) => {
  const competition = event.competitions?.[0] || {};
  const competitors = competition.competitors || [];
  
  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");

  const status = event.status?.type?.name; // e.g., "STATUS_SCHEDULED", "STATUS_IN_PROGRESS", "STATUS_FINAL"
  const isCompleted = event.status?.type?.completed;
  const isUpcoming = status === "STATUS_SCHEDULED";

  const venue = competition.venue || {};
  const gameOdds = competition.odds?.[0] || null;

  // Format Date: "Oct 24"
  const dateLabel = new Date(event?.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  // Format Time: "7:30 PM"
  const timeLabel = new Date(event?.date).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const isWinner = (team) => isCompleted && team?.winner;

  const TeamRow = ({ team }) => (
    <div className="flex items-center justify-between w-full py-1 text-sm">
      <span className={`font-medium truncate ${isWinner(team) ? "text-foreground" : "text-paper-300"}`}>
        {team?.team?.displayName}
      </span>

      {/* Only show score if the game is NOT upcoming */}
      {!isUpcoming && (
        <span className={`font-mono ${isWinner(team) ? "text-primary font-bold" : "text-paper-500"}`}>
          {team?.score || "0"}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex-none w-[255px] font-poppins">
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
          <TeamRow team={away} />
          <TeamRow team={home} />
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