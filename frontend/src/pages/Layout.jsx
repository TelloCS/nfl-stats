import { useEffect, useState, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../actions/authentication";
import { useUser } from "../hooks/useUser";
import { Birdhouse } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  const [input, setInput] = useState("");
  const [res, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchBarCache, setSearhBarCache] = useState({});
  const blurTimeoutRef = useRef(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      alert("Failed to logout. Please try again.");
    }
  });

  const fetchPlayers = async () => {
    if (searchBarCache[input]) {
      setResults(searchBarCache[input]);
      return;
    }

    if (input.length >= 2) {
      const data = await fetch("/nfl/players/?fullName=" + input);
      const json = await data.json();
      setResults(json?.players);
      setSearhBarCache(prev => ({ ...prev, [input]: json?.players }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowResults(false), 300);
  };

  const handleFocus = () => {
    clearTimeout(blurTimeoutRef.current);
    setShowResults(true);
  };

  if (isLoading) return <div className="h-[60px] bg-gray-50 border-b border-neutral-200" />;

  return (
    <>
      <div className="bg-gray-50">
        <div className="mx-auto max-w-[1400px] h-[80px]">
          <nav className="flex h-full px-8 items-center justify-between">
            <ul className="flex items-center justify-center gap-6 font-semibold">
              <li>
                <Link to="/"><Birdhouse size={32} /></Link>
              </li>
              <li><Link to="/position-vs-opponent">Position vs. Opponent</Link></li>
              <li><Link to="/team/stats">Team Stats</Link></li>
            </ul>

            <div className="flex items-center">
              <div className="relative w-full sm:w-64">
                <input
                  className="block w-full p-2.5 pl-4 text-sm rounded-full border-2 border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-200 transition duration-150"
                  type="text"
                  placeholder="Search player name..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {showResults && res.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white overflow-hidden border-2 border-neutral-200 rounded-lg shadow-lg">
                    {res.slice(0, 5).map((r) => (
                      <Link
                        key={r.id}
                        to={`/player/stats/id/${r.id}/${r.slug}/`}
                        onClick={() => setShowResults(false)}
                        className="bg-white hover:bg-gray-100 block p-3 text-sm border-b last:border-0 border-neutral-100"
                      >
                        {r.fullName}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {user ? (
                <>
                  <span className="text-gray-600 text-md border-r border-neutral-200 p-2">
                    Welcome, <strong>{user.username}</strong>
                  </span>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-red-500 text-md p-2 hover:underline disabled:opacity-50"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <div className="flex gap-4 items-center">
                  <Link to="/login" className="text-indigo-400 text-md hover:underline">Login</Link>
                  <Link to="/signup" className="bg-indigo-400 rounded-md text-white text-md p-2 hover:underline">Register</Link>
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