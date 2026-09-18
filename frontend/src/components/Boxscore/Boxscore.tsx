import { useParams, Link } from "react-router-dom";
import { PositionStatMap } from "../Config/Config";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import createBoxscoreQueryOptions from "../../queryOptions/createBoxscoreQueryOptions";
import type { PlayerStats } from "../../queryOptions/createBoxscoreQueryOptions";
import { usePlayersByPosition } from "../Team/Team.helper";
import CustomLoader from "../CustomLoader/CustomLoader";
import { getTeamStatusClass } from "../HistoricSlates/HistoricSlates.helpers";

const POSITIONS = ['QB', 'RB', 'WR', 'TE'] as const;
type Position = typeof POSITIONS[number];

export default function Boxscore() {
  const { game_id } = useParams<{ game_id?: string }>();

  const { data, isLoading } = useVersionedQuery(
    createBoxscoreQueryOptions,
    game_id ?? ""
  );

  const homeTeamRoster = usePlayersByPosition(
    data?.homeTeam.players ?? []
  );

  const awayTeamRoster = usePlayersByPosition(
    data?.awayTeam.players ?? []
  );

  const homeStyle = getTeamStatusClass(data?.home_score, data?.away_score);
  const awayStyle = getTeamStatusClass(data?.away_score, data?.home_score);

  if (!game_id || isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <CustomLoader color="" size="32" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto sm:p-4 md:px-8">
      <div className="flex flex-col">
        <div className="bg-geodude-950 border border-geodude-800 p-4 sm:p-6 mb-4 grid grid-cols-3 justify-center items-center">
          <div className="grid-span-1 font-bold text-foreground text-3xl text-left">
            <Link
              key={data.awayTeam.id}
              to={`/teams/${data.awayTeam.slug}`}
            >
              <span className='cursor-pointer hover:text-status-info'>
                {data.awayTeam.full_name}
              </span>
            </Link>
          </div>
          <div className="grid-span-1 font-bold text-paper-300 text-2xl text-center flex flex-row justify-center items-center gap-4">
            <div className={awayStyle}>
              {data?.away_score ?? "-"}
            </div>
            <div className="text-[10px] sm:text-xs text-paper-400 uppercase tracking-wider font-semibold">
              {data?.status}
            </div>
            <div className={homeStyle}>
              {data?.home_score ?? "-"}
            </div>
          </div>
          <div className="grid-span-1 font-bold text-foreground text-3xl text-right">
            <Link
              key={data.homeTeam.id}
              to={`/teams/${data.homeTeam.slug}`}
            >
              <span className='cursor-pointer hover:text-status-info'>
                {data.homeTeam.full_name}
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="grid-span-1 flex flex-col gap-4">
            {POSITIONS.map((pos) => (
              <Table key={`away-${pos}`} position={pos} teamRoster={awayTeamRoster} />
            ))}
          </div>

          <div className="grid-span-1 flex flex-col gap-4">
            {POSITIONS.map((pos) => (
              <Table key={`home-${pos}`} position={pos} teamRoster={homeTeamRoster} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

interface TableProps {
  position: Position;
  teamRoster: Record<Position, PlayerStats[]>;
}

const Table = ({ position, teamRoster }: TableProps) => {
  const positionStats = PositionStatMap[position] || [];
  const players = teamRoster[position] || [];

  if (players.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
      <table className="w-full border-collapse border-spacing-0 text-left">
        <thead className="bg-geodude-950 text-paper-400 h-[40px]">
          <tr className="border-b border-geodude-800 uppercase text-[10px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
            <th className="text-nowrap">Player</th>
            {positionStats.map((statDef) => (
              <th key={statDef.key} className="text-nowrap">
                {statDef.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-geodude-800/50">
          {players.map((stats) => (
            <tr
              key={stats.player.id}
              className="hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group"
            >
              <td className='text-nowrap font-medium text-foreground sticky left-0 bg-geodude-900 group-hover:bg-geodude-800'>
                <Link
                  key={stats.player.id}
                  to={`/players/${stats.player.id}/${stats.player.slug}/stats`}
                >
                  <span className='cursor-pointer hover:text-status-info'>
                    {stats.player.fullName}
                  </span>
                </Link>
              </td>

              {positionStats.map((statDef) => (
                <td key={statDef.key} className="text-nowrap">
                  {/* @ts-expect-error */}
                  {stats[statDef.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};