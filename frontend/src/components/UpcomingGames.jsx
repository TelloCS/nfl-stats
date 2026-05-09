import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollOverflow } from "../hooks/useScrollOverflow";
import { GameCard } from "./GameCard";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createUpcomingGamesQueryOptions from "../queryOptions/createUpcomingGamesQueryOptions";

export default function UpcomingGames() {
  const { data, isPending } = useVersionedQuery(createUpcomingGamesQueryOptions);
  const { scrollRef, canScroll, scroll } = useScrollOverflow(data);

  if (isPending || !data?.events?.length) return null;

  return (
    <div className="w-full bg-background border-b border-geodude-800 py-4 group">
      <div className="container mx-auto px-4 md:px-8 relative">

        {canScroll && (
          <>
            <ScrollButton direction="left" onClick={() => scroll("left")} />
            <ScrollButton direction="right" onClick={() => scroll("right")} />
          </>
        )}

        <div
          ref={scrollRef}
          className={`flex overflow-x-auto gap-3 md:gap-4 scrollbar-hide scroll-smooth px-1 ${!canScroll ? "justify-center" : "justify-start"
            }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.events.map((event, idx) => (
            <GameCard key={event.id || idx} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ScrollButton = ({ direction, onClick }) => {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      className={`absolute ${isLeft ? "left-2 md:left-6" : "right-2 md:right-6"} 
      top-1/2 -translate-y-1/2 z-10 bg-geodude-800 border border-geodude-800
      rounded-full p-1.5 text-paper-400 hover:text-foreground transition-all hidden md:flex`}
    >
      {isLeft ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
};