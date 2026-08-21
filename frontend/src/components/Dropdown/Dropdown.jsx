import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Dropdown({ isMobile, onLinkClick, navLinks, title }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="flex flex-col mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full rounded-lg font-semibold text-xl/9 px-3 py-2 text-paper-200 hover:bg-geodude-800 hover:text-primary transition-colors focus:outline-none"
        >
          {title}
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Accordion Dropdown Links */}
        {isOpen && (
          <div className="flex flex-col ml-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-200 border-l border-geodude-800">
            {navLinks?.map(({ to, label }) => (
              <NavLink
                to={to}
                key={to}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `rounded-r-lg font-medium text-lg/8 text-paper-400 hover:text-primary hover:bg-geodude-800 pl-6 pr-2 py-2 ${isActive
                    ? "text-primary"
                    : "text-paper-200 hover:bg-geodude-800 hover:text-primary"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="group relative py-2">
      <button
        className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none text-xs uppercase"
      >
        {title}
        <ChevronDown
          size={14}
          className="mt-[1px] transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      <div
        className="absolute left-0 top-full w-64 bg-geodude-900 rounded-lg border border-geodude-800 p-2 z-50 shadow-xl opacity-0 translate-y-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200"
      >
        {navLinks.map(({ to, label }) => (
          <NavLink
            to={to}
            key={to}
            className={({ isActive }) =>
              `block px-4 py-2 text-xs transition-colors normal-case font-medium rounded-lg uppercase tracking-widest ${isActive
                ? "text-primary"
                : "text-paper-200 hover:bg-geodude-800 hover:text-primary"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}