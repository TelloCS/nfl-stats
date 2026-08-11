import { memo } from "react";

const TeamSideSelector = memo(({ abbreviation, side, setSide, isOpponent }) => {
  const textColor = isOpponent ? "text-status-error" : "text-primary";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`${textColor} text-base font-bold tracking-wide`}>{abbreviation}</span>
      <div className="flex bg-geodude-900 p-1 w-full max-w-xs rounded-full border border-geodude-800 shrink-0 gap-1">
        <button
          onClick={() => setSide("off")}
          className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${side === "off"
            ? 'bg-geodude-700 text-foreground'
            : 'text-paper-500 hover:text-paper-300 hover:bg-geodude-700'
            }`}
        >
          OFF
        </button>
        <button
          onClick={() => setSide("def")}
          className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${side === "def"
            ? 'bg-geodude-700 text-foreground'
            : 'text-paper-500 hover:text-paper-300 hover:bg-geodude-700'
            }`}
        >
          DEF
        </button>
      </div>
    </div>
  );
});

export default memo(TeamSideSelector);