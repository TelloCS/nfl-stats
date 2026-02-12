import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <div className="relative">
      {isOpen && (
        <div
          className="fixed inset-0 z-30 w-full h-full cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative focus:outline-none z-40"
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-emerald-700 hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500 transition-all cursor-pointer">
          {getInitials(user?.username || user?.email)}
        </div>

        {!isOpen && (
          <div className="absolute right-0 top-full mt-2 w-max max-w-[200px] px-3 py-2 bg-[#333333] text-white text-xs rounded-md opacity-0 translate-y-[-5px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
            <p className="font-semibold truncate">{user?.username}</p>
            <p className="text-gray-400 truncate">{user?.email}</p>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">

          <div className="px-4 py-3 border-b border-gray-100 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User size={16} className="text-gray-400" />
            Your Profile
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="text-gray-400" />
            Settings
          </Link>

          <div className="h-px bg-gray-100 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}