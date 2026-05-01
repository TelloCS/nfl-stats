import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { House, Menu, X, Search } from 'lucide-react';
import UserDropdown from '../components/UserDropdown';
import SearchBar from '../components/SearchBar';
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, isLoading, isLoggedIn, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) return <div className="h-[80px] bg-neutral-950 border-b border-neutral-800" />;

  return (
    <>
      <div className="bg-black text-white sticky top-0 z-50 border-b border-neutral-800">
        <div className="container mx-auto max-w-full h-[80px]">
          <nav className="flex h-full px-8 items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden text-neutral-300 hover:text-white"
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <Menu size={28} />
              </button>
              <ul className="hidden lg:flex items-center justify-center gap-6 font-semibold">
                <li>
                  <Link to="/" className="hover:text-emerald-400 transition-colors">
                    <House size={28} />
                  </Link>
                </li>
                <li><Link to="/position-vs-opponent" className="hover:text-emerald-400 hover:underline transition-colors">Position vs Opponent</Link></li>
                <li><Link to="/team/stats" className="hover:text-emerald-400 hover:underline transition-colors">Team Stats</Link></li>
              </ul>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <SearchBar />
              <div className="flex gap-4 items-center">
                {isLoggedIn ? (
                  <UserDropdown user={user} onLogout={() => logoutMutation.mutate()} />
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <Link to="/signup" className="text-sm text-white hover:text-neutral-200 hover:underline font-bold transition-colors">Sign up</Link>
                    <Link to="/login" className="text-black bg-white rounded-full text-sm py-2.5 px-5 hover:bg-neutral-200 font-bold transition-colors">Log in</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button
                className="text-white hover:text-neutral-400 focus:outline-none transition-colors rounded-sm cursor-pointer p-0.5"
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMenuOpen(false);
                }}
                aria-label="Open search"
              >
                <Search size={24} />
              </button>

              {isLoggedIn ? (
                <UserDropdown user={user} onLogout={() => logoutMutation.mutate()} />
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/signup" className="hidden sm:block text-sm text-white hover:text-neutral-200 hover:underline font-bold transition-colors">Sign up</Link>
                  <Link to="/login" className="text-black bg-white rounded-full text-sm py-2.5 px-5 hover:bg-neutral-200 font-bold transition-colors">Log in</Link>
                </div>
              )}
            </div>
          </nav>
        </div>


        {/* Mobile */}
        {isMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[60]"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="bg-neutral-900 border-r-2 border-[#333333] absolute h-full w-[280px] left-0 top-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end px-3 py-4">
                <button
                  className="text-neutral-400 hover:text-white focus:outline-none transition-colors bg-neutral-800 rounded-sm cursor-pointer p-0.5"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col text-lg">
                <Link
                  to="/"
                  className="rounded-lg font-semibold text-xl/9 text-neutral-200 hover:text-emerald-400 hover:bg-neutral-800 transition-colors px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/position-vs-opponent"
                  className="rounded-lg font-semibold text-xl/9 text-neutral-200 hover:text-emerald-400 hover:bg-neutral-800 transition-colors px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Position vs Opponent
                </Link>
                <Link
                  to="/team/stats"
                  className="rounded-lg font-semibold text-xl/9 text-neutral-200 hover:text-emerald-400 hover:bg-neutral-800 transition-colors px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Team Stats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {isSearchOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[100] bg-black/30 backdrop-blur-xs flex justify-center items-start pt-20 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-[320px] bg-neutral-900 border border-neutral-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex text-white gap-2">
              <SearchBar onSearchComplete={() => setIsSearchOpen(false)} />
              <button
                className="text-neutral-400 hover:text-white focus:outline-none transition-colors"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}