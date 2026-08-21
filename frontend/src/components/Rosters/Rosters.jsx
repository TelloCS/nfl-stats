import { memo } from "react"
import { usePlayersByPosition } from "../Team/Team.helper"
import { PlayerPositionGroup } from "../Team/PlayerPositionGroup"

import { useVersionedQuery } from "../../hooks/useVersionedQuery"
import createPlayerTeammatesQueryOptions from "../../queryOptions/createPlayerTeammatesQueryOptions"


function Rosters({ data, showMatchup }) {
  const filters = {
    team: data?.stats[0]?.team?.abbreviation ?? data?.team?.abbreviation,
    season_year: data?.active_season,
  }

  const { data: teammates } = useVersionedQuery(
    createPlayerTeammatesQueryOptions,
    filters
  )
  const groupedPlayers = usePlayersByPosition(teammates?.players);

  if (filters.team === "FA") {
    return null
  };

  return (
    <div className="bg-geodude-900 h-full max-h-[500px] flex flex-col lg:col-span-1 p-4 sm:rounded-md border-t sm:border border-geodude-800">
      <div className="bg-geodude-800 border border-geodude-800 rounded-xl flex flex-row items-center text-paper-400 justify-between p-4 lg:px-2 mb-4">
        <div className="min-w-0">
          <span className="font-bold text-foreground text-lg truncate">Roster</span>
        </div>


        {(filters.team || filters.season_year) && (
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {filters.team} {filters.team && filters.season_year ? '•' : ''} {filters.season_year}
          </span>
        )}
      </div>

      <div className="w-full overflow-y-auto scrollbar-thin scrollbar-thumb-foreground font-mono">
        <div className={`grid grid-cols-1 ${!showMatchup ? "md:grid-cols-4" : "" } gap-2 text-xs`}>
          <PlayerPositionGroup players={groupedPlayers?.["QB"]} position="QB" />
          <PlayerPositionGroup players={groupedPlayers?.["RB"]} position="RB" />
          <PlayerPositionGroup players={groupedPlayers?.["WR"]} position="WR" />
          <PlayerPositionGroup players={groupedPlayers?.["TE"]} position="TE" />
        </div>
      </div>
    </div>
  )
}

export default memo(Rosters);