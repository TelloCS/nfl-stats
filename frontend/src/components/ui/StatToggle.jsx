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
              ? 'bg-neutral-800 text-white border border-neutral-600'
              : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}