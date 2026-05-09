import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function SelectDropdown({ value, onChange, options = [], minWidth = "120px" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel = options?.find(opt => String(opt.value) === String(value))?.label || value;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" style={{ minWidth }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-geodude-900 border border-geodude-800 text-sm
        rounded-md px-3 py-2 text-paper-200 hover:border-geodude-700 focus:outline-none"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`ml-2 h-4 w-4 text-paper-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-geodude-800 border border-geodude-700 rounded-md max-h-60 overflow-auto hide-scrollbar">
          <ul className="">
            {options?.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-geodude-700
                    ${String(value) === String(opt.value)
                      ? 'bg-geodude-800 text-status-success font-medium'
                      : 'bg-geodude-900 text-paper-400 hover:bg-geodude-800 hover:text-paper-200'
                    }`}
                >
                  {opt.label || opt.value}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}