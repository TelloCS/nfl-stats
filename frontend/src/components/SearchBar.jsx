import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createPlayerSearchQueryOptions from "../queryOptions/createPlayerSearchQueryOptions";

export default function SearchBar() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { data: searchResults } = useVersionedQuery(
    createPlayerSearchQueryOptions,
    debouncedInput
  );
  const displayResults = searchResults ? searchResults.slice(0, 5) : [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setSelectedIndex(-1);
    setShowResults(true);
  };

  const handleKeyDown = (e) => {
    if (!showResults || displayResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayResults.length) {
        const selected = displayResults[selectedIndex];
        setInput(selected.fullName);
        setShowResults(false);
        navigate(`/player/stats/id/${selected.id}/${selected.slug}`);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative w-full sm:w-64">
      <input
        className="bg-neutral-900 block w-full p-2.5 pl-4 text-sm rounded-lg border-1 border-neutral-800
        focus:outline-none"
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

      {showResults && displayResults.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden border-1 border-neutral-800 rounded-lg"
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
              }}
              role="option"
              aria-selected={index === selectedIndex}
              className={`bg-neutral-800 block p-3 text-sm border-b last:border-0 border-neutral-800 transition-colors ${index === selectedIndex ? "bg-hover:bg-neutral-800" : "bg-neutral-900 hover:hover:bg-neutral-800"
                }`}
            >
              {r.fullName}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}