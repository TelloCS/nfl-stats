import { memo } from "react";

const MatchupHeader = memo(({ shortName, date }) => (
  <div className="flex flex-row items-center justify-between bg-geodude-950 p-2 rounded-lg border border-geodude-800">
    <div className="min-w-0">
      <p className="font-bold text-foreground text-lg truncate">
        {shortName?.replace(' @ ', ' vs ')}
      </p>
    </div>
    <div className="bg-geodude-800 px-3 py-1 rounded-md">
      <p className="text-sm font-medium text-paper-300 whitespace-nowrap">
        {new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
    </div>
  </div>
));

export default memo(MatchupHeader);