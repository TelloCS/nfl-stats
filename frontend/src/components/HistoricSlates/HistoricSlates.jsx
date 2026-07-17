import { useState, useMemo } from "react";
import SelectDropdown from '../SelectDropdown';
import createSlatesQueryOptions from "../../queryOptions/createSlatesQueryOptions";

import { useVersionedQuery } from "../../hooks/useVersionedQuery";
import { buildFilterConfig, getTeamStatusClass } from "./HistoricSlates.helpers";

const DEFAULTS = {
  season_year: null,
  season_type: null,
  week: null
}

export default function HistoricSlates() {
  const [filter, setFilter] = useState(DEFAULTS);

  const { data, isPending } = useVersionedQuery(createSlatesQueryOptions, filter);
  const filterConfig = useMemo(() => buildFilterConfig(data), [data]);

  if (isPending) { return null }

  return (
    <div className="border border-geodude-800 bg-geodude-900 font-mono">
      <div className="flex flex-col lg:flex-row justify-center gap-6">
        <div className="grid grid-cols-1 p-4 sm:flex sm:flex-wrap gap-3 text-foreground ">
          <div className="col-span-1">
            <SelectDropdown
              value={data?.current?.season_year}
              onChange={(v) => setFilter((prev) => ({ ...prev, season_year: v }))}
              options={filterConfig.season_year}
              minWidth="100%"
              className="lg:min-w-[150px]"
            />
          </div>
          <div className="col-span-1">
            <SelectDropdown
              value={data?.current?.season_type}
              onChange={(v) => setFilter((prev) => ({ ...prev, season_type: v }))}
              options={filterConfig.season_type}
              minWidth="100%"
              className="lg:min-w-[150px]"
            />
          </div>
          <div className="col-span-1">
            <SelectDropdown
              value={data?.current?.week}
              onChange={(v) => setFilter((prev) => ({ ...prev, week: v }))}
              options={filterConfig.week}
              minWidth="100%"
              className="lg:min-w-[150px]"
            />
          </div>
        </div>
      </div>
      {data?.games.map((game) => {
        const homeStyle = getTeamStatusClass(game?.home_score, game?.away_score);
        const awayStyle = getTeamStatusClass(game?.away_score, game?.home_score);

        return (
          <div key={game.id} className="grid grid-cols-5 text-md text-paper-300 px-2 py-3 text-center items-center border-t border-geodude-800">
            <div className={homeStyle}>
              {game?.homeTeam?.abbreviation}
            </div>

            <div className={homeStyle}>
              {game?.home_score ?? "-"}
            </div>

            <div className="text-[10px] sm:text-xs text-paper-400 uppercase tracking-wider font-semibold">
              {game?.status}
            </div>

            <div className={awayStyle}>
              {game?.away_score ?? "-"}
            </div>

            <div className={awayStyle}>
              {game?.awayTeam?.abbreviation}
            </div>
          </div>
        );
      })}
    </div>
  );
};