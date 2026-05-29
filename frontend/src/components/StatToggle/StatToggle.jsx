import { memo } from "react";

function StatToggle({ options, activeKey, activeKeys, onSelect }) {
  if (!options || options.length === 0) return null;

  const getIsActive = (key) => {
    if (Array.isArray(activeKeys)) {
      return activeKeys.includes(key);
    }
    return activeKey === key;
  };

  return (
    <div className="flex gap-1.5 mb-4 pb-2 overflow-x-auto hide-scrollbar">
      {options.map((opt) => {
        const isActive = getIsActive(opt.key);
        
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              isActive
                ? 'bg-geodude-800 text-foreground border border-geodude-800'
                : 'bg-geodude-900 text-paper-400 border border-geodude-800 hover:bg-geodude-800 hover:text-paper-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default memo(StatToggle);