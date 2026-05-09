export const GameCard = ({ event }) => {
  const competitors = event.competitions?.[0]?.competitors || [];
  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");

  const status = event.status?.type?.name; // e.g., "STATUS_SCHEDULED", "STATUS_IN_PROGRESS", "STATUS_FINAL"
  const isCompleted = event.status?.type?.completed;
  const isUpcoming = status === "STATUS_SCHEDULED";

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
    <div className="flex-none w-[320px] font-poppins">
      <div className="bg-geodude-900 border border-geodude-800 rounded-lg p-4 hover:border-geodude-700 transition-all duration-200">

        <div className="flex justify-between items-center mb-3 pb-2 border-b border-geodude-800 text-xs uppercase tracking-widest">
          <span className="text-paper-400">{dateLabel}</span>
          <span className={isCompleted ? "text-paper-400" : "text-primary font-bold"}>
            {isUpcoming ? timeLabel : (event.status?.type?.detail || "Final")}
          </span>
        </div>

        <div className="flex flex-col gap-1 relative">
          <TeamRow team={away} />
          <TeamRow team={home} />
        </div>
      </div>
    </div>
  );
};