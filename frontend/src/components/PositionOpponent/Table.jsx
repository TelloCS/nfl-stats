import { memo } from 'react';
import { ChevronUp, ChevronDown, SearchX } from 'lucide-react';
import { Link } from "react-router-dom";

const ResultsTable = memo(({ isLoading, data, statsToShow, sortConfig, onHeaderClick }) => {
  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-paper-500 border border-geodude-800 rounded-lg bg-geodude-900 font-mono">
        Loading player data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 border border-geodude-800 rounded-lg bg-geodude-900 font-mono text-paper-500">
        <SearchX size={32} className="text-geodude-700" />
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
      <table className="w-full border-collapse border-spacing-0 text-left">
        <thead className="bg-geodude-950 text-paper-400 h-[40px]">
          <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
            <SortableTh label="Wk" sortKey="week" activeSort={sortConfig} onClick={() => onHeaderClick('week')} />
            <th className="text-nowrap sticky left-0 bg-geodude-950 z-10">Player</th>
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
        <tbody className="divide-y divide-geodude-800/50">
          {data.map((log) => (
            <tr key={log.id} className="hover:bg-geodude-800/50 transition duration-150 h-[48px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group">
              <td className="text-nowrap text-paper-500">{log.game.week}</td>
              <td className="text-nowrap font-medium text-foreground sticky left-0 bg-geodude-900 group-hover:bg-geodude-800">
                <Link
                  key={log.player.id}
                  to={`/player/stats/id/${log.player.id}/${log.player.slug}`}
                >
                  <span className='cursor-pointer hover:text-status-info'>
                    {log.player.fullName}
                  </span>
                </Link>
              </td>
              <td className="text-nowrap text-paper-400">{log.player.position}</td>
              <td className="text-nowrap">{log.team.abbreviation}</td>
              <td className="text-nowrap text-paper-400">{log.game.short_name}</td>
              <td className="text-nowrap text-paper-500">{log.game.away_score} - {log.game.home_score}</td>
              {statsToShow.map((statConfig) => (
                <td key={statConfig.key} className="text-nowrap text-paper-200">
                  {log[statConfig.key] ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const SortableTh = ({ label, sortKey, activeSort, onClick }) => (
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

export default memo(ResultsTable);