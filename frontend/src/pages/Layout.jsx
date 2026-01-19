import { useEffect, useState, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import { Birdhouse } from 'lucide-react';

export default function Layout() {
  const [input, setInput] = useState("");
  const [res, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searhBarCache, setSearhBarCache] = useState({})
  const blurTimeoutRef = useRef(null)

  const fetchPlayers = async () => {
    if (searhBarCache[input]) {
      setResults(searhBarCache[input]);
      return;
    };

    if (input.length >= 2) {
      const data = await fetch("/nfl/players/?fullName=" + input);
      const json = await data.json();
      setResults(json?.players);
      setSearhBarCache(prev => ({ ...prev, [input]: json?.players }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPlayers, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowResults(false);
    }, 300);
  };

  const handleFocus = () => {
    clearTimeout(blurTimeoutRef.current)
    setShowResults(true)
  };

  return (
    <>
      <div className="bg-gray-50">
        <div className="mx-auto max-w-[1400px] h-[80px]">
          <nav className="flex h-full px-8 items-center justify-between">
            <ul className="flex items-center justify-center gap-6 font-semibold">
              <li>
                <Link to="/" className="">
                  <Birdhouse size={32} />
                </Link>
              </li>
              <li>
                <Link to="/position-vs-opponent" className="">
                  Positon vs. Opponent
                </Link>
              </li>
              <li>
                <Link to="/team/stats" className="">
                  Team Stats
                </Link>
              </li>
            </ul>

            <div className="relative w-full sm:w-64">
              <div>
                <input
                  className="block w-full p-2.5 pl-4 text-sm rounded-full border-2 border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-200 transition duration-150" 
                  type="text"
                  placeholder="Search player name..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              {showResults && res.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white overflow-hidden border-2 border-neutral-200 rounded-lg">
                  {res.slice(0, 5).map((r) => (
                    <Link
                      key={r.id}
                      to={`/player/stats/id/${r.id}/${r.slug}/`}
                      onClick={() => setShowResults(false)}
                    >
                      <span
                        className="bg-gray-50 block p-3 text-sm"
                        key={r.id}
                      >
                        {r.fullName}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  );
}