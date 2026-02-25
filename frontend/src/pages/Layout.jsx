import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../actions/authentication";
import { useUser } from "../hooks/useUser";
import { ChartColumn, Menu, X } from 'lucide-react';
import UserDropdown from '../components/UserDropdown';
import SearchBar from '../components/SearchBar';

export default function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: () => alert("Failed to logout. Please try again.")
  });

  if (isLoading) return <div className="h-[60px] bg-white border-b border-neutral-200" />;

  return (
    <>
      <div className="bg-gray-50 text-bg-neutral-900 sticky top-0 z-50 border-b border-neutral-200">
        <div className="container mx-auto max-w-full h-[80px]">
          <nav className="flex h-full px-8 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/"><ChartColumn size={32} /></Link>
              <ul className="hidden lg:flex items-center justify-center gap-6 font-semibold">
                <li><Link to="/position-vs-opponent" className="hover:underline">Position vs Opponent</Link></li>
                <li><Link to="/team/stats" className="hover:underline">Team Stats</Link></li>
              </ul>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
              <SearchBar />
              <div className="flex gap-4 items-center">
                {user ? (
                  <UserDropdown user={user} onLogout={() => logoutMutation.mutate()} />
                ) : (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link to="/signup" className="text-sm hover:underline font-bold">Sign up</Link>
                    <Link to="/login" className="text-white bg-neutral-900 rounded-full text-sm py-3 px-5 hover:underline font-bold">Log in</Link>
                  </div>
                )}
                <button 
                  className="lg:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </nav>
        </div>
        
        {isMenuOpen && (
          <div className="bg-neutral-900 border-b border-neutral-200 absolute w-full left-0 top-[80px] z-40 px-8 py-6 flex flex-col gap-4 h-[calc(100vh-80px)]">
            <Link 
              to="/position-vs-opponent" 
              className="text-white font-semibold text-lg hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Position vs Opponent
            </Link>
            <Link 
              to="/team/stats" 
              className="text-white font-semibold text-lg hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Team Stats
            </Link>
            
            {!user && (
               <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-neutral-800">
                  <Link 
                    to="/login" 
                    className="text-white font-bold hover:text-emerald-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-neutral-900 rounded-lg font-bold text-center py-3 hover:bg-gray-100 transition-colors"
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