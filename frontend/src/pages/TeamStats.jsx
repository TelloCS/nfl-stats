import { useState } from "react";
import { NFLTeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from 'lucide-react';
import createTeamStatsQueryOptions from '../queryOptions/createTeamStatsQueryOptions';


export default function TeamStats() {
    const [table, setTable] = useState('team_offense_passing');
    const [activeTab, setActiveTab] = useState(NFLTeamStatMap[0]);
    const [statsToShow, setStatsToShow] = useState(NFLTeamStatMap[0].stats)
    const [sort, setSort] = useState({ keyToSort: '', direction: '' });

    const { data: teamData, isPending } = useQuery(createTeamStatsQueryOptions())

    function handleHeaderClick(header) {
        setSort({
            keyToSort: header.key,
            direction:
                header.key === sort.keyToSort ? sort.direction === 'asc' ? 'desc' : 'asc' : 'desc'
        })
    }

    function getSortedArray(arrayToSort) {
        if (!sort.keyToSort) {
            return arrayToSort;
        }

        const sortedArray = [...arrayToSort];

        const sorted = sortedArray.sort((a, b) => {
            const aValue = a[table][sort.keyToSort];
            const bValue = b[table][sort.keyToSort];

            if (sort.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });

        return sorted;
    }

    const sortedTeams = getSortedArray(teamData ?? []);

    return (
        <>
            <UpcomingGames />
            <div className="bg-gray-50 border-b border-neutral-200">
                <div className="container mx-auto flex px-8 py-4">
                    <div className="flex flex-wrap gap-4 pt-[6px] text-[13px] font-normal">
                        {NFLTeamStatMap.map((tab, index) => (
                            <button key={index}
                                onClick={() => {
                                    setActiveTab(NFLTeamStatMap[index]);
                                    setStatsToShow(NFLTeamStatMap[index].stats);
                                    setTable(tab.key);
                                    setSort({ keyToSort: '', direction: '' });
                                }}
                                className={`
                                                cursor-pointer whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors
                                                ${activeTab === NFLTeamStatMap[index]
                                        ? 'bg-neutral-800 text-white'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                    }
                                            `}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="container mx-auto flex p-8">
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse border-spacing-0">
                        <thead className="bg-gray-100 text-neutral-600">
                            <tr>
                                <th className="px-2 border-b border-neutral-200 font-semibold uppercase text-left text-xs h-[40px]">Team</th>
                                {statsToShow.map((stat, index) => (
                                    <th key={index} onClick={() => handleHeaderClick(stat)}
                                        className={`
                                                    px-2 border-b border-neutral-200 font-semibold uppercase text-xs h-[40px] cursor-pointer hover:bg-gray-200 min-w-[90px]
                                                    `}>
                                        <div className="flex items-center justify-center">
                                            <div className="w-4" aria-hidden="true"></div>
                                            <span className="flex-1 text-center">{stat.label}</span>
                                            <div className="w-4 flex items-center justify-center">
                                                {sort.keyToSort === stat.key && (
                                                    sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {sortedTeams.map((team, index) => (
                                <tr key={index} className="">
                                    <td className="px-2 h-[48px] text-nowrap border-b border-neutral-200 bg-[#ffffff] m-0 p-0 text-left text-sm">
                                        {team.full_name}
                                    </td>
                                    {statsToShow.map((statConfig, index) => {
                                        return (
                                            <td key={index} className="px-2 h-[48px] text-nowrap border-b border-neutral-200 bg-[#ffffff] m-0 p-0 text-center text-sm">
                                                {team[table][statConfig.key]}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}