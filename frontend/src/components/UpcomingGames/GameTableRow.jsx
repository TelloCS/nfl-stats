import { memo } from "react";
import { useGameCardData, isWinningTeam } from "../GameCard/GameCard.helpers";

const GameTableRow = memo(({ event }) => {
  const data = useGameCardData(event);

  if (!event || !data) return null;

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

  const awayIsWinner = isWinningTeam(away, isCompleted);
  const homeIsWinner = isWinningTeam(home, isCompleted);

  return (
    <tr className="hover:bg-geodude-800/50 transition duration-150 text-xs sm:text-sm text-paper-300 [&>td]:px-2 [&>td]:py-3 [&>td]:text-left group">
      <td className="text-nowrap min-w-[150px]">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="flex justify-between items-center pr-4">
            <span className={`font-bold ${awayIsWinner ? "text-foreground" : ""}`}>
              {away?.team?.abbreviation}
            </span>
            {!isUpcoming && (
              <span className={`font-mono ${awayIsWinner ? "text-primary font-bold" : "text-paper-500"}`}>
                {away?.score ?? "0"}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center pr-4">
            <span className={`font-bold ${homeIsWinner ? "text-foreground" : ""}`}>
              {home?.team?.abbreviation}
            </span>
            {!isUpcoming && (
              <span className={`font-mono ${homeIsWinner ? "text-primary font-bold" : "text-paper-500"}`}>
                {home?.score ?? "0"}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="text-nowrap align-top pt-3">{dateLabel}</td>

      <td className="text-nowrap align-top pt-3">
        <span className={`font-semibold ${isCompleted ? "text-paper-500" : "text-accent"}`}>
          {statusLabel}
        </span>
      </td>

      <td className="text-nowrap align-top pt-3">
        <span className="inline-flex items-center gap-1">
          {venue?.fullName || venue?.name || "TBD"}
          {venue?.indoor && (
            <span className="text-primary-400 leading-none inline-block">(Dome)</span>
          )}
        </span>
      </td>

      <td className="text-nowrap align-top pt-3 font-mono">
        {isUpcoming && gameOdds?.details ? (
          <span className="text-paper-200">{gameOdds.details}</span>
        ) : (
          <span className="text-paper-500">-</span>
        )}
      </td>

      <td className="text-nowrap align-top pt-3 font-mono">
        {isUpcoming && gameOdds?.overUnder ? (
          <span className="text-paper-200">{gameOdds.overUnder}</span>
        ) : (
          <span className="text-paper-500">-</span>
        )}
      </td>
    </tr>
  );
});

export default memo(GameTableRow);