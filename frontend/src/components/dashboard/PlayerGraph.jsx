import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { PositionStatMap, TeamRankingStatMap } from "../Config";
import CustomLoader from "../CustomLoader";
import createPlayerStatsQueryOptions from '../../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsRanksQueryOptions from "../../queryOptions/createTeamStatsRanksQueryOptions";
import { Dot } from 'lucide-react';


export default function PlayerGraph() {
  const [activeStat, setActiveStat] = useState("");
  const [activeTabKey, setActiveTabKey] = useState(TeamRankingStatMap[0].key);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  const { player_id, player_slug } = useParams();
  const { data, isPending } = useQuery(createPlayerStatsQueryOptions(player_id, player_slug));
  const { data: rankingData } = useQuery(createTeamStatsRanksQueryOptions())

  const availableStats = useMemo(() =>
    data?.position ? (PositionStatMap[data.position] || []) : [],
    [data?.position]
  );

  const currentStatKey = activeStat || (availableStats[0]?.key ?? "");
  const activeStatLabel = availableStats.find(s => s.key === currentStatKey)?.label;

  const selectedGameLog = data?.stats?.[selectedGameIndex];
  const teamOne = selectedGameLog?.game?.homeTeam?.abbreviation || "";
  const teamTwo = selectedGameLog?.game?.awayTeam?.abbreviation || "";

  const teamOneStats = useMemo(() =>
    rankingData?.find(t => t.abbreviation === teamOne),
    [rankingData, teamOne]);

  const teamTwoStats = useMemo(() =>
    rankingData?.find(t => t.abbreviation === teamTwo),
    [rankingData, teamTwo]);

  const activeCategory = TeamRankingStatMap.find(tab => tab.key === activeTabKey);

  const radarData = useMemo(() => {
    if (!activeCategory || !teamOneStats || !teamTwoStats) return [];
    return activeCategory.stats.map((stat) => ({
      subject: stat.label,
      [teamOne]: teamOneStats.rank_snapshot?.[stat.key] || 32,
      [teamTwo]: teamTwoStats.rank_snapshot?.[stat.key] || 32,
    }));
  }, [activeCategory, teamOneStats, teamTwoStats, teamOne, teamTwo]);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {isPending ? (
        <div className="flex justify-center items-center h-[500px]">
          <CustomLoader />
        </div>
      ) : (
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            <div className="lg:col-span-2 bg-white p-6 rounded-md border border-gray-100 h-[550px] flex flex-col">
              <div className="font-semibold mb-4 text-gray-800 flex justify-between items-center h-[39px]">
                <div>
                  <div className="text-lg flex items-center gap-1">
                    {data?.fullName} <Dot /> {activeStatLabel}
                  </div>
                  <div className="text-sm font-normal text-gray-600 flex items-center gap-1">
                    {data.team?.full_name} <Dot /> {`#${data?.jersey}`} <Dot /> {data?.position}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 mb-4 pb-2 overflow-x-auto">
                {availableStats.map((stat) => (
                  <button
                    key={stat.key}
                    onClick={() => setActiveStat(stat.key)}
                    className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors ${currentStatKey === stat.key
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.stats} margin={{ top: 36, right: 0, left: 0, bottom: 36 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="game.date"
                      tick={<CustomizedAxisTick stats={data?.stats} />}
                      interval="preserveStartEnd"
                      minTickGap={15}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey={currentStatKey}
                      fill="#333333"
                      radius={[5, 5, 0, 0]}
                      name={activeStatLabel}
                    >
                      <LabelList
                        dataKey={currentStatKey}
                        position="top"
                        style={{ fill: '#333333', fontSize: '12px' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md border border-gray-100 h-[550px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-800 text-lg">Matchups</span>
                <select
                  value={selectedGameIndex}
                  onChange={(e) => setSelectedGameIndex(Number(e.target.value))}
                  className="bg-white border-2 border-neutral-200 text-sm rounded-md hover:cursor-pointer max-w-[180px] p-2">
                  {data?.stats.map((stat, i) => (
                    <option key={stat.id} value={i}>Week {stat.game.week} - {stat.game.short_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1.5 mb-4 pb-2 overflow-x-auto">
                {TeamRankingStatMap.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-bold transition-colors ${activeTabKey === tab.key
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 400 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[1, 32]} />
                    <Radar name={teamOne} dataKey={teamOne} stroke="#333333" fill="#333333" fillOpacity={0.6} />
                    <Radar name={teamTwo} dataKey={teamTwo} stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.4} />
                    <Tooltip />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const CustomizedAxisTick = ({ x, y, payload, stats }) => {
  const item = stats?.[payload.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#333333" fontSize={12}>
        <tspan x="0" dy="1.2em">{payload.value}</tspan>
        <tspan x="0" dy="1.5em" style={{ fontSize: '10px', fill: '#333333' }}>
          {item?.game?.short_name}
        </tspan>
      </text>
    </g>
  );
};