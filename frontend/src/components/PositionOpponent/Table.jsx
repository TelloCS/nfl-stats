import { memo } from 'react';
import { ChevronUp, ChevronDown, SearchX } from 'lucide-react';
import { Link } from "react-router-dom";
import { SortableTh } from '../../helpers/table';

const ResultsTable = ({ isLoading, data, statsToShow, sortConfig, onHeaderClick }) => {
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
    <div className="w-full overflow-x-auto sm:rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
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
            <tr key={log.id} className="hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group">
              <td className="text-nowrap text-paper-500">{log.game.week}</td>
              <td className="text-nowrap font-medium text-foreground sticky left-0 bg-geodude-900 group-hover:bg-geodude-800">
                <Link
                  key={log.player.id}
                  to={`/players/${log.player.id}/${log.player.slug}/stats`}
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
};

export default memo(ResultsTable);