import createTeamsQueryOptions from "../../queryOptions/createTeamsQueryOptions";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";

import { groupTeamsByConferenceAndDivision } from "./Teams.helpers";
import { Link } from "react-router-dom";
import { memo } from "react";

function Teams() {
  const { data } = useVersionedQuery(
    createTeamsQueryOptions
  )
  const groupedTeams = groupTeamsByConferenceAndDivision(data?.teams)

  return (
    <div className="space-y-8 pt-8">
      <div className="min-w-0">
        <span className="font-semibold text-foreground text-2xl">NFL Teams</span>
      </div>

      {Object.entries(groupedTeams).map(([conference, divisions]) => (
        <div key={conference} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(divisions).map(([division, teams]) => (
              <div
                key={division}
                className="bg-geodude-900 border border-geodude-800 rounded-lg p-4"
              >
                <h3 className="text-md font-semibold mb-3 px-2">
                  {conference} {division}
                </h3>
                <ul className="space-y-2">
                  {teams.map((team) => (
                    <Link to={`/teams/${team.slug}`} key={team.id}>
                      <li
                        className="flex items-center justify-between text-paper-400 hover:text-foreground transition-colors py-1 px-2 rounded hover:bg-paper-400/5"
                      >
                        <span className="font-medium">{team.full_name}</span>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(Teams);