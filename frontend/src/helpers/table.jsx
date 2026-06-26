import { ChevronUp, ChevronDown } from "lucide-react";

export const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="cursor-pointer hover:text-foreground transition-colors group">
    <div className="flex gap-1">
      <span>{label}</span>
      <div className="w-3 flex items-center justify-center text-geodude-700 group-hover:text-primary transition-colors">
        {activeSort?.key === sortKey ? (
          activeSort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </div>
  </th>
);