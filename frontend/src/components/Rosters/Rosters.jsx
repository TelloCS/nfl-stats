import { memo } from "react"
import { Link } from "react-router-dom"
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

  return (
    <div className="bg-geodude-900 lg:col-span-1 p-4 sm:p-6 sm:rounded-md sm:border sm:border-geodude-800">
      <div className="flex flex-row items-center text-paper-400 justify-between mb-4">
        <div className="min-w-0">
          <span className="font-semibold text-foreground text-lg">Roster</span>
        </div>


        {(filters.team || filters.season_year) && (
          <span className="font-semibold text-foreground text-sm">
            {filters.team} {filters.team && filters.season_year ? '•' : ''} {filters.season_year}
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto max-h-[350px] overflow-y-auto hide-scrollbar font-mono">
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