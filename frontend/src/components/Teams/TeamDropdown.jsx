import { useState } from "react";
import { ChevronDown } from "lucide-react";
import createTeamsQueryOptions from "../../queryOptions/createTeamsQueryOptions";
import { useVersionedQuery } from "../../hooks/useVersionedQuery";

import { groupTeamsByConferenceAndDivision } from "./Teams.helpers";
import { NavLink } from "react-router-dom";
import { memo } from "react";

const TeamDropdown = ({ isMobile, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useVersionedQuery(
    createTeamsQueryOptions
  )
  const groupedTeams = groupTeamsByConferenceAndDivision(data?.teams)

  if (isMobile) {
    return (
      <div className="flex flex-col mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full rounded-lg font-semibold text-xl/9 px-3 py-2 text-paper-200 hover:bg-geodude-800 hover:text-primary transition-colors focus:outline-none"
        >
          Teams
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className="h-full max-h-[325px] overflow-y-auto scrollbar-thin scrollbar-thumb-foreground ml-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-200 border-l border-geodude-800"
          >
            {Object.entries(groupedTeams).map(([conference, divisions]) => (
              <div key={conference} className="space-y-4">
                <div className="grid grid-cols-1 gap-2 ">
                  {Object.entries(divisions).map(([division, teams]) => (
                    <div
                      key={division}
                      className="rounded-r-lg font-medium text-lg/8 text-paper-400 hover:text-primary pl-6 pr-2 py-2"
                    >
                      <h3 className="text-md font-semibold mb-1 px-2">
                        {conference} {division}
                      </h3>
                      <div className="bg-geodude-900 border-t border-geodude-800 py-1">
                        {teams.map((team) => (
                          <NavLink to={`/teams/${team.slug}`} key={team.id} onClick={onLinkClick}
                            className={({ isActive }) =>
                              `block px-2 py-1 text-xs transition-colors normal-case font-medium rounded-lg uppercase tracking-widest ${isActive
                                ? "text-primary"
                                : "text-paper-400 hover:bg-geodude-800 hover:text-primary"
                              }`
                            }
                          >
                            {team.nickname}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="group relative py-2">
      <button
        className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none text-xs uppercase"
      >
        Teams
        <ChevronDown
          size={14}
          className="mt-[1px] transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      <div
        className="
          absolute left-0 top-full w-xl bg-geodude-900 rounded-lg border border-geodude-800 p-2 z-50 opacity-0 translate-y-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200
        "
      >
        {Object.entries(groupedTeams).map(([conference, divisions]) => (
          <div key={conference} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(divisions).map(([division, teams]) => (
                <div
                  key={division}
                  className="p-1"
                >
                  <h3 className="text-md font-semibold mb-1 px-2">
                    {conference} {division}
                  </h3>
                  <div className="bg-geodude-900 border-t border-geodude-800 py-1">
                    {teams.map((team) => (
                      <NavLink to={`/teams/${team.slug}`} key={team.id}
                        className={({ isActive }) =>
                          `block px-2 py-1 text-xs transition-colors normal-case font-medium rounded-lg uppercase tracking-widest ${isActive
                            ? "text-primary"
                            : "text-paper-200 hover:bg-geodude-800 hover:text-primary"
                          }`
                        }
                      >
                        {team.nickname}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(TeamDropdown);