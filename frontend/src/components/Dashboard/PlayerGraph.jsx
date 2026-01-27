import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PositionStatMap } from "../Config";
import CustomLoader from "../CustomLoader";
import createPlayerStatsQueryOptions from '../../queryOptions/createPlayerStatsQueryOptions';

export default function PlayerGraph() {
    const [activeStat, setActiveStat] = useState("");

    const { player_id, player_slug } = useParams();
    const { data, isPending } = useQuery(createPlayerStatsQueryOptions(player_id, player_slug));

    const availableStats = (!isPending && data?.position)
        ? PositionStatMap[data.position] || []
        : [];

    useEffect(() => {
        if (availableStats.length > 0 && !activeStat) {
            setActiveStat(availableStats[0].key);
        }
    }, [availableStats, activeStat]);

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            {isPending ?
            <div className="flex justify-center items-center h-[500px]">
                <CustomLoader /> 
            </div>
            : <div className="container mx-auto">    
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {availableStats.map((stat) => (
                        <button
                            key={stat.key}
                            onClick={() => setActiveStat(stat.key)}
                            className={`whitespace-nowrap px-4 py-2 rounded-sm border transition-all duration-150 font-medium text-sm
                            ${activeStat === stat.key
                                ? 'border-none bg-[#333333] text-white'
                                : 'border border-neutral-200 bg-white text-black hover:border-neutral-600'}`}
                        >
                            {stat.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 h-[450px]">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">{data?.fullName} - {availableStats.find(s => s.key === activeStat)?.label}</h3>
                        </div>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={data?.stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="game.date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 16 }} />
                                <Tooltip />
                                <Bar
                                    dataKey={activeStat}
                                    fill="#333333"
                                    radius={[0, 0, 0, 0]}
                                    name={availableStats.find(s => s.key === activeStat)?.label}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 min-h-[450px]">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Insights</h3>
                        <div className="text-gray-500">
                            Your other content will now sit perfectly to the right...
                        </div>
                    </div>

                </div>
            </div>}
        </div>
    );
}