export const GameCard = ({ event }) => {
  const competitors = event.competitions?.[0]?.competitors || [];
  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");

  return (
    <div className="flex-none w-[140px] text-center text-xs">
      <div className="border border-neutral-800 rounded-md p-3 hover:border-neutral-700 transition-colors h-full flex flex-col justify-between gap-2 bg-neutral-900">
        <div className="text-neutral-300 font-medium tracking-wide">
          {home?.team?.abbreviation} <span className="text-neutral-500 font-normal">vs</span> {away?.team?.abbreviation}
        </div>
        <div className="text-neutral-500">
          {event.status?.type?.completed ? "Final" : "Upcoming"}
        </div>
        <div className="text-emerald-400 font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded py-1 mt-1 flex justify-center gap-2">
          <span>{home?.score || "0"}</span>-<span>{away?.score || "0"}</span>
        </div>
      </div>
    </div>
  );
};