import { memo } from 'react';
import { ChevronUp, ChevronDown, SearchX } from 'lucide-react';
import { Link } from "react-router-dom";
import { formatOrdinal } from "./FantasyRankings.helpers";


const Table = memo(({ isPositionFiltered, isLoading, data, currentFormat, sortConfig, onHeaderClick }) => {
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
            <SortableTh
              label={`${currentFormat.label} Rk`}
              sortKey={currentFormat.rankKey}
              activeSort={sortConfig}
              onClick={() => onHeaderClick(currentFormat.rankKey)}
            />
            <th className='text-nowrap sticky left-0 bg-geodude-950 z-10"'>Player</th>
            <th className='text-nowrap'>Pos</th>
            <th className='text-nowrap'>Team</th>
            <th className='text-nowrap'>GP</th>
            <SortableTh label="Pass Yds" sortKey="pass_yards" activeSort={sortConfig} onClick={() => onHeaderClick('pass_yards')} />
            <SortableTh label="Pass TD" sortKey="pass_touchdowns" activeSort={sortConfig} onClick={() => onHeaderClick('pass_touchdowns')} />
            <SortableTh label="INT" sortKey="interceptions" activeSort={sortConfig} onClick={() => onHeaderClick('interceptions')} />
            <SortableTh label="Rush Yds" sortKey="rush_yards" activeSort={sortConfig} onClick={() => onHeaderClick('rush_yards')} />
            <SortableTh label="Rush TD" sortKey="rush_touchdowns" activeSort={sortConfig} onClick={() => onHeaderClick('rush_touchdowns')} />
            <SortableTh label="Rec" sortKey="receptions" activeSort={sortConfig} onClick={() => onHeaderClick('receptions')} />
            <SortableTh label="Rec Yds" sortKey="rec_yards" activeSort={sortConfig} onClick={() => onHeaderClick('rec_yards')} />
            <SortableTh label="Rec TD" sortKey="rec_touchdowns" activeSort={sortConfig} onClick={() => onHeaderClick('rec_touchdowns')} />

            <SortableTh label="Fum" sortKey="fumbles" activeSort={sortConfig} onClick={() => onHeaderClick('fumbles')} />
            <SortableTh label="Lost" sortKey="fumbles_lost" activeSort={sortConfig} onClick={() => onHeaderClick('fumbles_lost')} />
            <SortableTh label="Two PT" sortKey="two_pt_conversions" activeSort={sortConfig} onClick={() => onHeaderClick('two_pt_conversions')} />
            <SortableTh label="Off Fum Rec TD" sortKey="off_fum_rec_tds" activeSort={sortConfig} onClick={() => onHeaderClick('off_fum_rec_tds')} />
            <SortableTh label="Kick Ret TD" sortKey="kick_return_tds" activeSort={sortConfig} onClick={() => onHeaderClick('kick_return_tds')} />
            <SortableTh label="Punt Ret TD" sortKey="punt_return_tds" activeSort={sortConfig} onClick={() => onHeaderClick('punt_return_tds')} />
            <SortableTh
              label={`${currentFormat.label} Pts`}
              sortKey={currentFormat.value}
              activeSort={sortConfig}
              onClick={() => onHeaderClick(currentFormat.value)}
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-geodude-800/50">
          {data.map((stat) => (
            <tr key={stat.id} className='hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group'>
              <td className="text-nowrap text-paper-200">
                {isPositionFiltered
                  ? formatOrdinal(stat[currentFormat.posRankKey]) || '--'
                  : formatOrdinal(stat[currentFormat.rankKey]) || '--'}
              </td>
              <td className='text-nowrap font-medium text-foreground sticky left-0 bg-geodude-900 group-hover:bg-geodude-800'>
                <Link
                  key={stat.player.id}
                  to={`/player/stats/id/${stat.player.id}/${stat.player.slug}`}
                >
                  <span className='cursor-pointer hover:text-status-info'>
                    {stat.player.fullName}
                  </span>
                </Link>
              </td>
              <td className='text-nowrap text-paper-400'>{stat.player.position}</td>
              <td className='text-nowrap'>{stat.player.historic_team.abbreviation}</td>
              <td className='text-nowrap'>{stat.games_played}</td>
              <td className="text-nowrap text-paper-200">{stat.pass_yards}</td>
              <td className="text-nowrap text-paper-200">{stat.pass_touchdowns}</td>
              <td className="text-nowrap text-paper-200">{stat.interceptions}</td>
              <td className="text-nowrap text-paper-200">{stat.rush_yards}</td>
              <td className="text-nowrap text-paper-200">{stat.rush_touchdowns}</td>
              <td className="text-nowrap text-paper-200">{stat.receptions}</td>
              <td className="text-nowrap text-paper-200">{stat.rec_yards}</td>
              <td className="text-nowrap text-paper-200">{stat.rec_touchdowns}</td>

              <td className="text-nowrap text-paper-200">{stat.fumbles}</td>
              <td className="text-nowrap text-paper-200">{stat.fumbles_lost}</td>
              <td className="text-nowrap text-paper-200">{stat.two_pt_conversions}</td>
              <td className="text-nowrap text-paper-200">{stat.off_fum_rec_tds}</td>
              <td className="text-nowrap text-paper-200">{stat.kick_return_tds}</td>
              <td className="text-nowrap text-paper-200">{stat.punt_return_tds}</td>
              <td className="text-nowrap text-paper-200">
                {stat[currentFormat.value] || '0.0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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

export default memo(Table);