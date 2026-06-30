import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import { formatOrdinal } from "../FantasyRankings/FantasyRankings.helpers";
import createPlayerCareerFantasyRankingsQueryOptions from "../../queryOptions/createPlayerCareerFantasyRankingsQueryOptions";

function PlayerCareerStats({ availableStats, currentFormat, seasonType }) {
  const { player_id, player_slug } = useParams();

  const {
    data,
    isPending,
    isError
  } = useVersionedQuery(
    createPlayerCareerFantasyRankingsQueryOptions,
    player_id,
    player_slug
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(row => String(row.season_type) === String(seasonType));
  }, [data, seasonType]);

  if (isError) {
    return (
      <div className="p-4 bg-geodude-900 border border-status-error rounded-lg">
        <p className="text-status-error text-sm text-center">Failed to load career stats.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-40 bg-geodude-900 border border-geodude-800 rounded-lg">
        <p className="text-paper-400 text-sm animate-pulse">Loading career stats...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredData.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
            <table className="w-full border-collapse border-spacing-0 text-left">
              <thead className="bg-geodude-950 text-paper-400 h-[40px]">
                <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
                  <th className='text-nowrap'>Team</th>
                  <th className='text-nowrap'>Season</th>
                  <th className='text-nowrap'>GP</th>
                  {availableStats.map((stat) => (
                    <th key={stat.key} className='text-nowrap'>{stat.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-geodude-800/50">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group">
                    <td className="text-nowrap text-paper-500">{row.historic_team.abbreviation}</td>
                    <td className="text-nowrap text-paper-500">{row.season_year}</td>
                    <td className="text-nowrap text-paper-500">{row.games_played}</td>
                    {availableStats.map((statConfig) => (
                      <td key={statConfig.key} className="text-nowrap text-paper-200">
                        {row[statConfig.key] ?? 0}
                      </td>
                    ))}
                  </tr>

                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
            <table className="w-full border-collapse border-spacing-0 text-left">
              <thead className="bg-geodude-950 text-paper-400 h-[40px]">
                <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
                  <th className='text-nowrap'>Team</th>
                  <th className='text-nowrap'>Season</th>
                  <th className='text-nowrap'>GP</th>
                  <th className='text-nowrap'>{`${currentFormat.label} Rk`}</th>
                  <th className='text-nowrap'>{currentFormat.posRankLabel}</th>
                  <th className='text-nowrap'>{currentFormat.points}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-geodude-800/50">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-geodude-800/50 transition duration-150 h-[30px] text-xs text-paper-300 [&>td]:px-2 [&>td]:text-left group">
                    <td className="text-nowrap text-paper-500">{row.historic_team.abbreviation}</td>
                    <td className="text-nowrap text-paper-500">{row.season_year}</td>
                    <td className="text-nowrap text-paper-500">{row.games_played}</td>
                    <td className="text-nowrap text-paper-200">
                      {formatOrdinal(row[currentFormat.rankKey] || '--')}
                    </td>
                    <td className="text-nowrap text-paper-200">
                      {formatOrdinal(row[currentFormat.posRankKey] || '--')}
                    </td>
                    <td className="text-nowrap text-paper-200">
                      {row[currentFormat.value] || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-4 bg-geodude-900 border border-geodude-800 rounded-lg">
          <p className="text-paper-400 text-sm text-center">
            No career stats found for this season type.
          </p>
        </div>
      )}
    </div>
  )
};

export default memo(PlayerCareerStats);