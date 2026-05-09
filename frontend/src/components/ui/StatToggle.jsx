export default function StatToggle({ options, activeKey, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex gap-1.5 mb-4 pb-2 overflow-x-auto hide-scrollbar">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors ${
            activeKey === opt.key
              ? 'bg-geodude-800 text-foreground border border-geodude-800'
              : 'bg-geodude-900 text-paper-400 border border-geodude-800 hover:bg-geodude-800 hover:text-paper-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}