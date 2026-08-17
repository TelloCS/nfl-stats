import { useState, useEffect, useCallback } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X, Search } from 'lucide-react';
import UserDropdown from '../components/UserDropdown';
import SearchBar from '../components/SearchBar';
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle";
import { useIsDesktop } from "../hooks/useMediaQueries";
import StatusErrorModal from '../components/StatusErrorModal';
import Dropdown from "../components/Dropdown";
import { TEAM_NAV_LINKS, PLAYER_NAV_LINKS } from "./utils";

export default function Layout() {
  const { user, isLoading, isLoggedIn, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isDesktop = useIsDesktop();

  if (isDesktop && (isMenuOpen || isSearchOpen)) {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, []);

  useEffect(() => {
    if (!isSearchOpen && !isMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAllMenus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAllMenus, isSearchOpen, isMenuOpen]);

  if (isLoading) return <div className="h-[80px] bg-geodude-950 border-b border-geodude-800" />;

  return (
    <>
      <div className="bg-background text-foreground sticky top-0 z-50 border-b border-geodude-800 transition-colors duration-200">
        <div className="container mx-auto max-w-full h-[80px]">
          <nav className="flex h-full px-4 items-center justify-between">
            <div className="flex items-center gap-6">

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden text-paper-300 hover:text-foreground transition-colors"
                onClick={() => { setIsSearchOpen(false); setIsMenuOpen(!isMenuOpen); }}
              >
                <Menu size={24} />
              </button>

              {/* Desktop Nav Links */}
              <ul className="hidden lg:flex items-center justify-center gap-6 font-semibold text-xs uppercase tracking-widest">
                <li key={"/"} className="hover:text-primary transition-colors flex items-center hover:border rounded-md border-none">
                  <Link to={"/"} className="hover:text-primary transition-colors flex items-center">
                    <Logo />
                  </Link>
                </li>
                <li>
                  <Dropdown
                    navLinks={PLAYER_NAV_LINKS}
                    title={"Players"}
                  />
                </li>
                <li>
                  <Dropdown
                    navLinks={TEAM_NAV_LINKS}
                    title={"Teams"}
                  />
                </li>
              </ul>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <SearchBar />
              </div>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-geodude-800 text-paper-400 hover:text-foreground transition-colors border border-transparent hover:border-geodude-800"
                onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}
              >
                <Search size={24} />
              </button>
              <AuthActions isLoggedIn={isLoggedIn} user={user} logoutMutation={logoutMutation} />
            </div>
          </nav>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-geodude-900 border-r-2 border-geodude-333 absolute h-full w-[280px] left-0 top-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end px-3 py-4">
                <button onClick={() => setIsMenuOpen(false)} className="text-paper-400 hover:text-foreground focus:outline-none transition-colors hover:bg-geodude-800 hover:text-primary rounded-sm cursor-pointer p-1"><X size={24} /></button>
              </div>
              <div className="flex flex-col text-lg p-2 gap-1">
                <Link to={"/"} onClick={() => setIsMenuOpen(false)} className="rounded-lg font-semibold text-xl/9 text-paper-200 hover:text-primary hover:bg-geodude-800 px-3 py-2">
                  Home
                </Link>
                <Dropdown
                  isMobile={true}
                  onLinkClick={() => setIsMenuOpen(false)}
                  navLinks={PLAYER_NAV_LINKS}
                  title={"Players"}
                />
                <Dropdown
                  isMobile={true}
                  onLinkClick={() => setIsMenuOpen(false)}
                  navLinks={TEAM_NAV_LINKS}
                  title={"Teams"}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-background/50 backdrop-blur-sm flex justify-center items-start pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex text-foreground">
              <SearchBar onSearchComplete={() => setIsSearchOpen(false)} />
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}

const AuthActions = ({ isLoggedIn, user, logoutMutation }) => (
  <div className="flex items-center gap-4">
    <ThemeToggle />
    {isLoggedIn ? (
      <UserDropdown user={user} onLogout={() => logoutMutation.mutate()} />
    ) : (
      <>
        <Link to="/signup" className="text-sm text-foreground hover:text-paper-200 hover:underline font-bold transition-colors hidden sm:block md:block">Sign up</Link>
        <Link to="/login" className="bg-inverted-bg text-inverted-text rounded-full text-sm py-2.5 px-5 hover:opacity-80 font-bold transition-opacity">Log in</Link>
      </>
    )}
    <StatusErrorModal
      isOpen={logoutMutation.isError}
      onClose={() => logoutMutation.reset()}
      title="Logout Failed"
      message={logoutMutation.error?.response?.data?.detail}
      fallback="An unexpected error occurred while logging out. Please try again."
    />
  </div>
);

function Logo() {
  return (
    <div className="text-foreground hover:text-primary transition-colors cursor-pointer">
      <svg
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[44px] h-[44px]"
      >
        <path d="M9 7 L9 22 M27 7 L27 22 M9 22 L27 22 M18 22 L18 30" />
      </svg>
    </div>
  );
}