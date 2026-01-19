import { useEffect, useState } from "react";
import Layout from "./Layout";
import { NFLTeamStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';


function TeamStats() {
    const [ teamData, setTeamData ] = useState([])
    const [ teamDataCache, setTeamDataCahe ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ table, setTable ] = useState('team_offense_passing');
    const [ activeTab, setActiveTab ] = useState(NFLTeamStatMap[0]);
    const [ statsToShow, setStatsToShow ] = useState(NFLTeamStatMap[0].stats)
    const [ sort, setSort ] = useState({ keyToSort: '', direction: '' });

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

    useEffect(() => {
        const fetchTeamData = async () => {
            setLoading(true)
            
            try {
                const data = await fetch("/nfl/team/stats/");
                const json = await data.json();
                setTeamData(json);
            } catch (error) {
            } finally {
                setLoading(false)
            }
        }
        fetchTeamData()
        }, [])

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
                                                ${
                                                    activeTab === NFLTeamStatMap[index]
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
                                                <th key={index} onClick={() => handleHeaderClick(stat.key)}
                                                    className="px-2 font-semibold uppercase text-center text-sm h-[40px]">
                                                    {stat.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {getSortedArray(teamData).map((team, index) => (
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
            {/* <div className="min-h-screen bg-zinc-950">
                <Layout />
                <div className="flex flex-col p-4 sm:p-8 gap-4">
                    <UpcomingGames />
                    <div className="flex justify-start bg-zinc-900 p-6 rounded-xl shadow-lg">
                        <div className="flex bg-zinc-800 p-1 rounded-lg overflow-x-auto shadow-inner">
                            {NFLTeamStatMap.map((tab, index) => (
                                <button key={index}
                                    onClick={() => {
                                        setActiveTab(NFLTeamStatMap[index]);
                                        setStatsToShow(NFLTeamStatMap[index].stats);
                                        setTable(tab.key);
                                        setSort({ keyToSort: '', direction: '' });
                                    }}
                                        className={`
                                            px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap 
                                            transition duration-200 ease-in-out 
                                            ${
                                                activeTab === NFLTeamStatMap[index]
                                                    ? 'bg-lime-400 text-zinc-900 shadow-md' 
                                                    : 'text-zinc-200 hover:text-lime-400' 
                                            }
                                        `}>
                                        {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-xl shadow-xl">
                        <div className="overflow-x-auto -m-6">
                            <table className="min-w-full divide-y divide-zinc-700">
                                <thead className="bg-zinc-800 sticky top-0">
                                    <tr>
                                        <th className="w-24 p-3 text-left text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">Team</th>
                                        {statsToShow.map((stat, index) => (
                                            <th key={index} onClick={() => handleHeaderClick(stat)}
                                                className="cursor-pointer p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap 
                                                           hover:bg-lime-400 hover:text-zinc-900 transition duration-150">
                                                {stat.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {getSortedArray(teamData).map((team, index) => (
                                        <tr key={index} className="odd:bg-zinc-900 even:bg-zinc-800 hover:bg-zinc-700 transition duration-150">
                                            <td className="w-24 p-3 text-left text-sm tracking-wide font-semibold text-zinc-200 whitespace-nowrap">
                                                {team.nickname}
                                            </td>
                                            {statsToShow.map((statConfig, index) => {
                                                return (
                                                    <td key={index} className="w-16 p-3 text-center text-sm tracking-wide text-zinc-200 whitespace-nowrap">
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
            </div> */}
        </>
    )
}

export default TeamStats;