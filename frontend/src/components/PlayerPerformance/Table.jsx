import { memo, useMemo } from "react";
import useUrlTableSort from "../../hooks/useUrlTableSort";
import { SortableTh } from "../../helpers/table";

const Table = ({ data, availableStats }) => {
  const stats = data?.stats || data || [];
  const customGetters = useMemo(() => ({
    week: (log) => log.game?.week ?? 0,
  }), []);

  const { sortedItems, handleHeaderClick, sortConfig } = useUrlTableSort(stats, customGetters);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
      <table className="w-full border-collapse border-spacing-0 text-left">
        <thead className="bg-geodude-950 text-paper-400 h-[40px]">
          <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
            <SortableTh
              key="week"
              label="Wk"
              sortKey="week"
              activeSort={sortConfig}
              onClick={() => handleHeaderClick('week')}
            />
            <th className="text-nowrap">Date</th>
            <th className="text-nowrap">Matchup</th>
            <th className="text-nowrap">Score</th>
            {availableStats.map((stat) => (
              <SortableTh
                key={stat.key}
                label={stat.label}
                sortKey={stat.key}
                activeSort={sortConfig}
                onClick={() => handleHeaderClick(stat.key)}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-geodude-800/50">
          {sortedItems.map((log) => (
            <tr key={log.game.id} className="hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group">
              <td className="text-nowrap text-paper-500">{log.game.week}</td>
              <td className="text-nowrap text-paper-500">{log.game.date}</td>
              <td className="text-nowrap text-paper-400">{log.game.short_name}</td>
              <td className="text-nowrap text-paper-500">{log.game.away_score} - {log.game.home_score}</td>
              {availableStats.map((statConfig) => (
                <td key={statConfig.key} className="text-nowrap text-paper-200">
                  {log[statConfig.key] ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(Table)