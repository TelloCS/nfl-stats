import { memo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollOverflow } from "../../hooks/useScrollOverflow";
import GameCard from "../GameCard";
import useUpcomingGames from "../../hooks/useUpcomingGames";

function UpcomingGames() {
  const { data, isPending } = useUpcomingGames();
  const { scrollRef, canScroll, scroll } = useScrollOverflow(data);

  const handleScrollLeft = useCallback(() => scroll("left"), [scroll]);
  const handleScrollRight = useCallback(() => scroll("right"), [scroll]);

  if (isPending || !data?.events?.length) return null;

  return (
    <div className="w-full bg-background border-b border-geodude-800 py-4 group">
      <div className="container mx-auto px-4 md:px-8 relative">

        {canScroll && (
          <>
            <ScrollButton direction="left" onClick={handleScrollLeft} />
            <ScrollButton direction="right" onClick={handleScrollRight} />
          </>
        )}

        <div
          ref={scrollRef}
          className={`flex overflow-x-auto gap-3 scrollbar-hide scroll-smooth ${!canScroll ? "justify-center" : "justify-start"
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

const ScrollButton = memo(({ direction, onClick }) => {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      className={`absolute ${isLeft ? "left-0 md:left-2" : "right-0 md:right-2"}
      top-1/2 -translate-y-1/2 z-10 bg-geodude-800 border border-geodude-800
      rounded-full p-1 text-paper-400 hover:text-foreground transition-all hidden md:flex`}
    >
      {isLeft ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
});

export default memo(UpcomingGames);