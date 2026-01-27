import { useState } from "react";
import { NFLTeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import { useQuery } from "@tanstack/react-query";
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
            <div className="">
                <div className="">
                    <UpcomingGames />
                    <div className="bg-gray-50">
                        <div className="container mx-auto flex px-4 py-8">
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
                                                underline decoration-4 underline-offset-8 text-black/80 cursor-pointer
                                                ${activeTab === NFLTeamStatMap[index]
                                                ? 'font-bold'
                                                : 'opacity-60'
                                            }
                                            `}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="container mx-auto flex px-4 py-8">
                        <div className="relative w-full">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-neutral-200 text-left">
                                        <tr>
                                            <th className="px-2 font-semibold uppercase text-left text-sm h-[40px]">Team</th>
                                            {statsToShow.map((stat, index) => (
                                                <th key={index} onClick={() => handleHeaderClick(stat)}
                                                    className={`
                                                    px-2 font-semibold uppercase text-center text-sm h-[40px]
                                                    cursor-pointer hover:bg-indigo-400 hover:text-white
                                                    `}>
                                                    {stat.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {sortedTeams.map((team, index) => (
                                            <tr key={index} className="">
                                                <td className="h-[48px] text-nowrap border-b border-neutral-200 bg-[#ffffff] m-0 p-0 text-left text-sm">
                                                    {team.nickname}
                                                </td>
                                                {statsToShow.map((statConfig, index) => {
                                                    return (
                                                        <td key={index} className="h-[48px] text-nowrap border-b border-neutral-200 bg-[#ffffff] m-0 p-0 text-center text-sm">
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
                    </div>
                </div>
            </div>
        </>
    )
}