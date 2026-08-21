import { memo } from "react";
import { useGameCardData, isWinningTeam } from "./GameCard.helpers";

const GameCard = ({ event }) => {
  const data = useGameCardData(event);

  if (!event) return null;

  const {
    home,
    away,
    isCompleted,
    isUpcoming,
    venue,
    gameOdds,
    dateLabel,
    statusLabel,
  } = data;

  return (
    <div className="flex-none w-[140px] sm:w-[259px] font-poppins">
      <div className="bg-geodude-900 border border-geodude-800 rounded-lg p-1.5 sm:p-2.5 hover:border-geodude-700 transition-all duration-200">

        <div className="flex justify-between items-center mb-1 sm:mb-2 pb-1 sm:pb-2 border-b border-geodude-800 text-[10px] sm:text-xs uppercase tracking-widest">
          <span className="text-paper-400 hidden sm:inline-flex items-center gap-1">
            {dateLabel} {venue.indoor && <span className="text-primary-400 inline-block -rotate-90 text-xs sm:text-sm leading-none -translate-y-[1px]">D</span>}
          </span>
          <span className={`font-semibold ${isCompleted ? "text-paper-500" : "text-accent"}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-col gap-2 relative">
          <TeamRow
            team={away}
            isWinner={isWinningTeam(away, isCompleted)}
            isUpcoming={isUpcoming}
          />
          <TeamRow
            team={home}
            isWinner={isWinningTeam(home, isCompleted)}
            isUpcoming={isUpcoming}
          />
        </div>

        <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-geodude-800 flex justify-between text-[10px] sm:text-xs text-paper-400 font-mono">
          <span>
            <span className="hidden sm:inline">Line: </span>
            <span className="text-paper-200">{gameOdds?.details ?? "N/A"}</span>
          </span>
          <span>
            <span className="hidden sm:inline">O/U: </span>
            <span className="text-paper-200">{gameOdds?.overUnder ?? "N/A"}</span>
          </span>
        </div>

      </div>
    </div>
  );
};

const TeamRow = memo(({ team, isWinner, isUpcoming }) => (
  <div
    className="flex flex-row justify-between w-full text-xs sm:text-sm gap-0.5 sm:gap-0"
    aria-label={isWinner ? `${team?.team?.displayName ?? "Team"} - winner` : undefined}
  >
    <span className={`font-bold truncate ${isWinner ? "text-foreground" : "text-paper-300"}`}>
      <span className="sm:hidden">{team?.team?.abbreviation}</span>
      <span className="hidden sm:inline">{team?.team?.displayName}</span>
    </span>

    {!isUpcoming && (
      <span className={`font-mono ${isWinner ? "text-primary font-bold" : "text-paper-500"}`}>
        {team?.score ?? "0"}
      </span>
    )}
  </div>
));

export default memo(GameCard);