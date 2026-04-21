import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { House , Menu, X } from 'lucide-react';
import UserDropdown from '../components/UserDropdown';
import SearchBar from '../components/SearchBar';
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, isLoading, isLoggedIn, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e) => {
      if (e.matches) setIsMenuOpen(false);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isLoading) return <div className="h-[80px] bg-neutral-950 border-b border-neutral-800" />;

  return (
    <>
      <div className="bg-[#000000] text-white sticky top-0 z-50 border-b border-neutral-800">
        <div className="container mx-auto max-w-full h-[80px]">
          <nav className="flex h-full px-4 md:px-8 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-emerald-400 transition-colors">
                <House size={32} />
              </Link>
              <ul className="hidden lg:flex items-center justify-center gap-6 font-semibold">
                <li><Link to="/position-vs-opponent" className="hover:text-emerald-400 hover:underline transition-colors">Position vs Opponent</Link></li>
                <li><Link to="/team/stats" className="hover:text-emerald-400 hover:underline transition-colors">Team Stats</Link></li>
              </ul>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
              <SearchBar />
              <div className="flex gap-4 items-center">
                {isLoggedIn ? (
                  <UserDropdown user={user} onLogout={() => logoutMutation.mutate()} />
                ) : (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link to="/signup" className="text-sm text-white hover:text-neutral-200 hover:underline font-bold transition-colors">Sign up</Link>
                    <Link to="/login" className="text-[#000000] bg-white rounded-full text-sm py-2.5 px-5 hover:bg-neutral-200 font-bold transition-colors">Log in</Link>
                  </div>
                )}
                <button
                  className="lg:hidden text-neutral-300 hover:text-white"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen
                    ? <X size={24} className="bg-neutral-800 rounded-sm hover:bg-neutral-700 cursor-pointer p-0.5" />
                    : <Menu size={24} className="cursor-pointer" />}
                </button>
              </div>
            </div>
          </nav>
        </div>
        

        {/* Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 absolute w-full left-0 top-[80px] z-40 px-8 py-6 flex flex-col gap-4">
            <Link
              to="/position-vs-opponent"
              className="font-semibold text-lg text-neutral-200 hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Position vs Opponent
            </Link>
            <Link
              to="/team/stats"
              className="font-semibold text-lg text-neutral-200 hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Team Stats
            </Link>

            {!user && (
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800 mt-2">
                <Link
                  to="/login"
                  className="font-semibold text-lg text-neutral-200 hover:text-emerald-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="font-semibold text-lg text-neutral-200 hover:text-emerald-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}