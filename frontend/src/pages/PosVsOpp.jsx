import { useEffect, useState, useMemo } from "react";
import { PositionStatMap, NFL_POSITIONS } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import { useSearchParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

const PosVsOpp = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedPosition, setSelectedPosition] = useState(searchParams.get("position") || 'QB');
    const [selectedOpponent, setSelectedOpponent] = useState(searchParams.get("opponent") || 'CIN');

    const [searchQuery, setSearchQuery] = useState({
        position: selectedPosition,
        opponent: selectedOpponent
    });

    const [teamAbbreviation, setTeamAbbreviation] = useState([]);
    const [sort, setSort] = useState({ keyToSort: '', direction: '' });
    const [statsToShow, setStatsToShow] = useState(PositionStatMap[searchQuery.position]);

    const { data: logs, isLoading } = useQuery({
        queryKey: ['gameLogs', searchQuery.position, searchQuery.opponent],
        queryFn: async () => {
            const response = await fetch(`/nfl/player/stats/gamelogs/?position=${searchQuery.position}&opponent=${searchQuery.opponent}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        }
    });

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await fetch('/nfl/teams/');
                const resp = await data.json();
                setTeamAbbreviation(resp?.teams || []);
            } catch (error) {
                console.error("Failed to fetch teams", error);
            }
        };
        fetchTeams();
    }, []);

    const handleHeaderClick = (header) => {
        setSort((prev) => ({
            keyToSort: header.key,
            direction: header.key === prev.keyToSort && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortedArray = (arrayToSort) => {
        if (!sort.keyToSort || !arrayToSort) return arrayToSort;

        return [...arrayToSort].sort((a, b) => {
            let aValue, bValue;

            if (sort.keyToSort === 'week') {
                aValue = a.game?.week ?? 0;
                bValue = b.game?.week ?? 0;
            } else {
                aValue = a[sort.keyToSort] ?? 0;
                bValue = b[sort.keyToSort] ?? 0;
            }

            if (sort.direction === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    };

    const sortedGameLogs = useMemo(() => {
        return getSortedArray(logs);
    }, [logs, sort]);

    const handleSearch = () => {
        setSearchQuery({
            position: selectedPosition,
            opponent: selectedOpponent
        });
        
        setStatsToShow(PositionStatMap[selectedPosition]);
        setSearchParams({
            position: selectedPosition,
            opponent: selectedOpponent
        });
    };
    
    console.log(NFL_POSITIONS)

    return (
        <>  
            <UpcomingGames />
            <div className="bg-gray-50 border-b border-neutral-200">
                <div className="container mx-auto flex px-4 py-8 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <select 
                            value={selectedOpponent}
                            onChange={(e) => setSelectedOpponent(e.target.value)} 
                            className="bg-white border-2 border-neutral-200 px-4 rounded-md h-10 hover:cursor-pointer min-w-[120px]"
                        >
                            {teamAbbreviation.map((team) => (
                                <option key={team.id || team.abbreviation} value={team.abbreviation}>
                                    {team.abbreviation}
                                </option>
                            ))}
                        </select>

                        <select 
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="bg-white border-2 border-neutral-200 px-4 rounded-md h-10 hover:cursor-pointer min-w-[100px]"
                        >
                            {NFL_POSITIONS.map((pos) => (
                                <option key={pos.value} value={pos.value}>
                                    {pos.label || pos.value}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 text-white px-8 rounded-md h-10 font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto flex px-4 py-8">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 text-neutral-600">
                            <tr>
                                <th 
                                    onClick={() => handleHeaderClick({ key: 'week' })}
                                    className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px] cursor-pointer hover:bg-gray-200"
                                >
                                    Week {sort.keyToSort === 'week' && (sort.direction === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Player</th>
                                <th className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Pos</th>
                                <th className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Team</th>
                                <th className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Matchup</th>
                                <th className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px]">Score</th>
                                {statsToShow.map((stat) => (
                                    <th
                                        key={stat.key} 
                                        onClick={() => handleHeaderClick(stat)}
                                        className="px-1 border-b border-neutral-200 font-semibold uppercase text-center text-xs h-[40px] cursor-pointer hover:bg-gray-200"
                                    >
                                        {stat.label} {sort.keyToSort === stat.key && (sort.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="100%" className="p-12 text-center text-gray-500 text-lg">
                                        Loading player data...
                                    </td>
                                </tr>
                            ) : sortedGameLogs?.length > 0 ? (
                                sortedGameLogs.map((log) => (
                                    <tr key={log.id} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50 transition duration-150">
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.game.week}</td>
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.fullName}</td>
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.position}</td>
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.player.team.abbreviation}</td>
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">{log.game.short_name}</td>
                                        <td className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">
                                            {log.game.home_score} - {log.game.away_score}
                                        </td>
                                        {statsToShow.map((statConfig) => (
                                            <td key={statConfig.key} className="px-1 h-[48px] text-nowrap border-b border-neutral-200 m-0 p-0 text-center text-sm">
                                                {log[statConfig.key] ?? 0}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="100%" className="p-12 text-center text-gray-500">
                                        No results found for {searchQuery.position} vs {searchQuery.opponent}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default PosVsOpp;