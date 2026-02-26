import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import createUpcomingGamesQueryOptions from "../queryOptions/createUpcomingGamesQueryOptions";
import formatDate from "../helpers/utils/"

export default function UpcomingGames() {
  const { data, isPending } = useQuery(createUpcomingGamesQueryOptions());
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (isPending || !data?.games?.length) return null;

  return (
    <div className="w-full bg-white border-b border-neutral-200 py-4 relative group">
      <div className="container mx-auto px-8 relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-neutral-200 rounded-full p-1.5 shadow-sm text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hidden md:flex disabled:opacity-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.games.map((game, index) => (
            <div key={index} className="flex-none w-[140px] text-center text-xs">
              <div className="border border-neutral-200 rounded-md p-3 hover:border-neutral-300 transition-colors h-full flex flex-col justify-between gap-2 bg-gray-50/50">
                <div className="text-neutral-900">
                  {game.homeTeam.abbreviation} vs {game.awayTeam.abbreviation}
                </div>

                <div className="text-neutral-900 font-medium">
                  {formatDate(game.date)}
                </div>

                {game.awayTeam?.total?.map((value, i) => (
                  <div key={i} className="text-emerald-600 font-semibold bg-emerald-50 rounded px-1 py-0.5">
                    {value.open_line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-neutral-200 rounded-full p-1.5 shadow-sm text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hidden md:flex transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}