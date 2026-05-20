import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import { Player, createPlayerSearchQueryOptions } from "../queryOptions/createPlayerSearchQueryOptions";

type SearchBarProp = {
  onSearchComplete?: () => void;
}

export default function SearchBar({ onSearchComplete }: SearchBarProp) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { data: searchResults } = useVersionedQuery(
    createPlayerSearchQueryOptions,
    debouncedInput
  );

  const displayResults: Player[] = searchResults ? searchResults.slice(0, 5) : [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedIndex(-1);
    setShowResults(true);
  };

  const handleSelect = (player: Player) => {
    if (!player) return;

    setInput(player.fullName);
    setShowResults(false);
    setSelectedIndex(-1);
    navigate(`/player/stats/id/${player.id}/${player.slug}`);
    onSearchComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || displayResults.length === 0) {
      if (e.key === "Escape") setShowResults(false);
      return;
    }

    const lastIndex = displayResults.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < lastIndex ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : lastIndex));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex <= lastIndex) {
          handleSelect(displayResults[selectedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setShowResults(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div className="w-full relative lg:w-[320px]">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-paper-400" />
        </div>
        <input
          className="block w-full p-4 pl-10 lg:p-2.5 lg:pl-10 text-sm text-foreground border border-geodude-800 rounded-lg bg-geodude-900 focus:outline-none focus:ring-1 focus:ring-geodude-700 focus:border-transparent transition-all duration-200"
          type="text"
          placeholder="Search player name..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => { if (input.length > 0) setShowResults(true); }}
          onBlur={() => setShowResults(false)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showResults}
        />
        <div className="lg:hidden absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <kbd className="text-paper-400 text-sm border border-geodude-800 px-2 py-1 rounded-md">
            esc
          </kbd>
        </div>
      </div>

      {showResults && displayResults.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden border-1 border-geodude-800 rounded-lg"
          role="listbox"
        >
          {displayResults.map((r, index) => (
            <Link
              key={r.id}
              to={`/player/stats/id/${r.id}/${r.slug}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowResults(false);
                setInput(r.fullName);
                onSearchComplete?.();
              }}
              role="option"
              aria-selected={index === selectedIndex}
              className={`block p-3 text-sm border-b last:border-0 border-geodude-800 transition-colors ${index === selectedIndex
                ? "bg-geodude-800 text-foreground"
                : "bg-geodude-900 text-paper-200 hover:bg-geodude-800 hover:text-foreground"
                }`}
            >
              <div className="flex flex-col">
                <div className="justify-between items-center">
                  <span className={`font-semibold ${index === selectedIndex ? "text-foreground" : "text-paper-100"}`}>
                    {r.fullName}
                  </span>
                </div>

                {r.team?.full_name && (
                  <span className="text-xs text-paper-400 mt-0.5">
                    {r.team.full_name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}