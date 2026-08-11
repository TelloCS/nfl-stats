import { memo } from "react";

const MatchupHeader = memo(({ shortName, date, showMatchup }) => (
  <div className={`bg-geodude-950 border border-geodude-800 flex flex-row items-center justify-between rounded-xl p-4 lg:px-2 order-1 ${!showMatchup ? 'lg:mb-4 lg:col-span-1 lg:order-2' : ''}`}>
    <div className="min-w-0">
      <p className="font-bold text-foreground text-lg truncate">
        {shortName?.replace(' @ ', ' vs ')}
      </p>
    </div>
    <p className="text-sm font-medium text-foreground whitespace-nowrap">
      {new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
    </p>
  </div>
));

export default memo(MatchupHeader);