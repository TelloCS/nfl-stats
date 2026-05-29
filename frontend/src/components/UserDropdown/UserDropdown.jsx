import { useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex items-center justify-center p-2 rounded-lg hover:bg-geodude-800 text-paper-400 hover:text-foreground transition-colors border border-transparent hover:border-geodude-800">
          <User size={24} />
        </div>

        {!isOpen && (
          <div className="absolute right-0 top-full mt-2 w-max max-w-[200px] px-3 py-2 bg-geodude-900 text-foreground text-xs rounded-md border border-geodude-800 opacity-0 translate-y-[-5px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
            <p className='text-paper-400 truncate'>Open user navigation menu</p>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-geodude-900 rounded-lg border border-geodude-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">

          <div className="px-4 py-3 border-b border-geodude-800 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.username}
            </p>
            <p className="text-xs text-paper-400 truncate">
              {user?.email}
            </p>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2 text-sm text-paper-400 hover:bg-geodude-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="text-paper-400" />
            Settings
          </Link>

          <div className="h-px bg-geodude-800 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-paper-400 hover:bg-geodude-800 transition-colors text-left"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}