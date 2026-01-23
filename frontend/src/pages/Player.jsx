import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useParams } from "react-router-dom";
import { RankingTabsV2, PositionStatMap } from '../components/Config';
import UpcomingGames from '../components/UpcomingGames';
import TinyBarChart from "../pages/PlayerStats";

function Player() {
    const { player_id, player_slug } = useParams();
    const [ teamData, setTeamData ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ loadTeamRanks, setLoadTeamRanks ] = useState(true);

    const [ position, setPosition ] = useState('DEFAULT');
    const [ playerData, setPlayerData ] = useState([]);

    const [ table, setTable ] = useState('team_offense_passing');
    const [ activeTab, setActiveTab ] = useState(RankingTabsV2[0]);
    const [ statsToShow, setStatsToShow ] = useState(PositionStatMap[position])
    const [ statHeaders, setStatHeaders ] = useState(RankingTabsV2[0].stats)
    
    useEffect(() => {
        const fetchPlayerStats = async () => {
            setLoading(true)

            try {
                const resp = await fetch(`/nfl/player/stats/id/${player_id}/${player_slug}`)
                const data = await resp.json()
                setPlayerData(data)
                setStatsToShow(PositionStatMap[data.position])
            } catch (err) {
                
            } finally {
                setLoading(false)
            }
        };
        
        fetchPlayerStats()
    }, [player_id])

    useEffect(() => {
        const fetchTeamRanks = async () => {
            setLoadTeamRanks(true)

        try {
            const response = await fetch('/nfl/team/stats/');
            const rankList = await response.json();

            const teamDataMap = rankList.reduce((acc, team) => {
                const flattenedStats = {};
                
                for (const key in team) {
                    const value = team[key];
                    
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        Object.assign(flattenedStats, value);
                    } else {
                        flattenedStats[key] = value;
                    }
                }
                acc[team.id] = flattenedStats;
                return acc;
            }, {});
            
            setTeamData(teamDataMap);

            } catch (error) {
                
            } finally {
                setLoadTeamRanks(false)
            }
        };
        fetchTeamRanks()
    }, [])
    
    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getOrdinalSuffix = (n) => {
        if (typeof n !== 'number') return '';
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    const getSortedStats = () => {
        if (!playerData.stats) {
            return [];
        }
        
        return playerData.stats.slice().sort((a, b) => new Date(a.game.date) - new Date(b.game.date));
    };

    return (
        <div className="min-h-screen w-full bg-white">
            {/* <Layout /> */}
            <div className="flex flex-col p-4 sm:p-8 gap-4">
                <UpcomingGames />
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 lg:w-1/3 min-w-0 bg-zinc-900 p-6 rounded-xl shadow-lg">
                        <div className="mb-6 pb-4 border-b border-zinc-800">
                            <h1 className="text-2xl font-extrabold text-lime-400">{playerData.fullName}</h1>
                            <p className="text-l text-zinc-200 mt-1">
                                {playerData.team?.full_name} - {playerData.position} - #{playerData.jersey}
                            </p>
                        </div>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-800">
                                    <tr>
                                        <th className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">Date</th>
                                        <th className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">Matchup</th>
                                        <th className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">Score</th>
                                        {statsToShow.map((stat) => (
                                            <th
                                                key={stat.key}
                                                className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">
                                                {stat.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {getSortedStats().map((stat) => (
                                        <tr key={stat.id} className="odd:bg-zinc-900 even:bg-zinc-800 hover:bg-zinc-700 transition duration-150">
                                            <td className="w-16 p-3 text-center text-sm tracking-wide text-zinc-200 whitespace-nowrap">
                                                {stat.game.date}
                                            </td>
                                            <td className="w-16 p-3 text-center text-sm tracking-wide text-lime-400 whitespace-nowrap">
                                                {stat.game.short_name}
                                            </td>
                                            <td className="w-16 p-3 text-center text-sm tracking-wide text-zinc-200 whitespace-nowrap">
                                                {stat.game.away_score} - {stat.game.home_score}
                                            </td>
                                            {statsToShow.map((statConfig) => (
                                                <td
                                                    key={statConfig.key}
                                                    className="w-16 p-3 text-center text-sm tracking-wide text-zinc-200 whitespace-nowrap">
                                                    {stat[statConfig.key] || 0}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* <div className="flex-1 lg:w-2/3 min-w-0 bg-zinc-900 p-6 rounded-xl shadow-lg">
                        <div className="flex bg-zinc-800 p-1 rounded-lg mb-6 overflow-x-auto shadow-inner"> 
                            {RankingTabsV2.map((tab, index) => (
                                <button key={index}
                                    onClick={() => {
                                        setActiveTab(RankingTabsV2[index]);
                                        setStatHeaders(RankingTabsV2[index].stats);
                                        setTable(tab.key)}}
                                        className={`
                                            px-3 py-1.5 rounded-md text-sm font-medium 
                                            whitespace-nowrap transition duration-200 ease-in-out 
                                            ${
                                                activeTab === RankingTabsV2[index]
                                                    ? 'bg-lime-400 text-zinc-900 shadow-md' 
                                                    : 'text-zinc-200 hover:text-lime-400' 
                                            }
                                        `}>
                                        {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-800">
                                    <tr className="bg-zinc-800">
                                        <th className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">Matchup</th>

                                        {statHeaders.map((header) => (
                                            <th key={header.key} className="w-16 p-3 text-center text-xs tracking-wider font-semibold text-zinc-200 uppercase whitespace-nowrap">
                                                {header.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {getSortedStats().map((stat) => {
                                        const awayTeamRanks = teamData[stat.game.awayTeam.id] || {};
                                        const homeTeamRanks = teamData[stat.game.homeTeam.id] || {};
                                        
                                        return (
                                            <tr key={stat.id} className="odd:bg-zinc-900 even:bg-zinc-800 hover:bg-zinc-700 transition duration-150">
                                                <td className="w-16 p-3 text-center text-sm tracking-wide text-lime-400 whitespace-nowrap">
                                                    {stat.game.short_name}
                                                </td>
                                                {statHeaders.map((header) => {
                                                    const statKey = header.key;

                                                    const awayRankValue = awayTeamRanks[statKey];
                                                    const homeRankValue = homeTeamRanks[statKey];

                                                    const awayRank = typeof awayRankValue === 'number' && awayRankValue > 0
                                                        ? awayRankValue + getOrdinalSuffix(awayRankValue) 
                                                        : '-';
                                                    
                                                    const homeRank = typeof homeRankValue === 'number' && homeRankValue > 0
                                                        ? homeRankValue + getOrdinalSuffix(homeRankValue) 
                                                        : '-';
                                                    
                                                    return (
                                                        <td key={statKey} className="w-16 p-3 text-center text-sm tracking-wide text-zinc-200 whitespace-nowrap">
                                                            {`${awayRank} vs ${homeRank}`}
                                                        </td>
                                                        
                                                    );
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
        // <TinyBarChart />
    )
}

export default Player;