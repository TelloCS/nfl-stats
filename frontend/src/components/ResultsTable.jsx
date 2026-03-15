import { memo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ResultsTable = memo(({ isLoading, data, statsToShow, sortConfig, onHeaderClick }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 hide-scrollbar font-mono">
    <table className="w-full border-collapse border-spacing-0 text-left">
      <thead className="bg-neutral-950 text-neutral-400 h-[40px]">
        <tr className="border-b border-neutral-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
          <SortableTh label="Wk" sortKey="week" activeSort={sortConfig} onClick={() => onHeaderClick('week')} />
          <th className="text-nowrap sticky left-0 bg-neutral-950 z-10">Player</th>
          <th className="text-nowrap">Pos</th>
          <th className="text-nowrap">Team</th>
          <th className="text-nowrap">Matchup</th>
          <th className="text-nowrap">Score</th>
          {statsToShow.map((stat) => (
            <SortableTh
              key={stat.key}
              label={stat.label}
              sortKey={stat.key}
              activeSort={sortConfig}
              onClick={() => onHeaderClick(stat.key)}
            />
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-800/50">
        {isLoading ? (
          <tr><td colSpan="100%" className="p-12 text-center text-neutral-500">Loading player data...</td></tr>
        ) : data?.length > 0 ? (
          data.map((log) => (
            <tr key={log.id} className="hover:bg-neutral-800/50 transition duration-150 h-[48px] text-xs text-neutral-300 [&>td]:px-2 [&>td]:text-left">
              <td className="text-nowrap text-neutral-500">{log.game.week}</td>
              <td className="text-nowrap font-medium text-white sticky left-0 bg-neutral-900 group-hover:bg-neutral-800">
                {log.player.fullName}
              </td>
              <td className="text-nowrap text-neutral-400">{log.player.position}</td>
              <td className="text-nowrap">{log.team.abbreviation}</td>
              <td className="text-nowrap text-neutral-400">{log.game.short_name}</td>
              <td className="text-nowrap text-neutral-500">{log.game.away_score} - {log.game.home_score}</td>
              {statsToShow.map((statConfig) => (
                <td key={statConfig.key} className="text-nowrap text-neutral-200">
                  {log[statConfig.key] ?? 0}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr><td colSpan="100%" className="p-12 text-center text-neutral-500">No results found.</td></tr>
        )}
      </tbody>
    </table>
  </div>
));

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
  <th onClick={onClick} className="cursor-pointer hover:text-white transition-colors group">
    <div className="flex gap-1">
      <span>{label}</span>
      <div className="w-3 flex items-center justify-center text-neutral-600 group-hover:text-emerald-500 transition-colors">
        {activeSort?.key === sortKey ? (
          activeSort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </div>
  </th>
);

export default ResultsTable;