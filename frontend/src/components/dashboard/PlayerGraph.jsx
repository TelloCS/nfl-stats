import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { PositionStatMap, RankingTabsV2 } from "../Config";
import CustomLoader from "../CustomLoader";
import createPlayerStatsQueryOptions from '../../queryOptions/createPlayerStatsQueryOptions';
import createTeamStatsQueryOptions from "../../queryOptions/createTeamStatsQueryOptions";


export default function PlayerGraph() {
  const [activeStat, setActiveStat] = useState("");
  const [teamOne, setTeamOne] = useState("");
  const [teamTwo, setTeamTwo] = useState("");

  const [activeTabKey, setActiveTabKey] = useState(RankingTabsV2[0].key);

  const { player_id, player_slug } = useParams();
  const { data, isPending } = useQuery(createPlayerStatsQueryOptions(player_id, player_slug));

  const { data: rankingData } = useQuery(createTeamStatsQueryOptions())

  const teamOneStats = useMemo(() =>
    rankingData?.find(t => t.abbreviation === teamOne),
    [rankingData, teamOne]);

  const teamTwoStats = useMemo(() =>
    rankingData?.find(t => t.abbreviation === teamTwo),
    [rankingData, teamTwo]);

  const availableStats = (!isPending && data?.position)
    ? PositionStatMap[data.position] || []
    : [];

  const activeCategory = RankingTabsV2.find(tab => tab.key === activeTabKey);

  const handleDropdownChange = (e) => {
    const selectedIndex = e.target.value;
    if (!data?.stats?.[selectedIndex]) return;

    const selectedGame = data.stats[selectedIndex].game;
    setTeamOne(selectedGame.homeTeam.abbreviation);
    setTeamTwo(selectedGame.awayTeam.abbreviation);
  };

  useEffect(() => {
    const gameData = data?.stats?.[0]?.game;
    if (!isPending && gameData) {
      setTeamOne(gameData.homeTeam.abbreviation);
      setTeamTwo(gameData.awayTeam.abbreviation);
    }
  }, [isPending, data]);

  useEffect(() => {
    if (availableStats.length > 0 && !activeStat) {
      setActiveStat(availableStats[0].key);
    }
  }, [availableStats, activeStat]);

  const CustomizedAxisTick = ({ x, y, payload }) => {
    const item = data?.stats[payload.index];

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

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {isPending ? (
        <div className="flex justify-center items-center h-[500px]">
          <CustomLoader />
        </div>
      ) : (
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 h-[550px] flex flex-col">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  {data?.fullName} - {availableStats.find(s => s.key === activeStat)?.label}
                </h3>
              </div>
              <div className="flex gap-3 mb-6 pb-2 flex-wrap">
                {availableStats.map((stat) => (
                  <button
                    key={stat.key}
                    onClick={() => setActiveStat(stat.key)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeStat === stat.key
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.stats} margin={{ top: 36, right: 0, left: 0, bottom: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="game.date"
                    tick={<CustomizedAxisTick />}
                    interval="preserveStartEnd"
                    minTickGap={15}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey={activeStat}
                    fill="#333333"
                    radius={[5, 5, 0, 0]}
                    name={availableStats.find(s => s.key === activeStat)?.label}
                  >
                    <LabelList
                      dataKey={activeStat}
                      position="top"
                      style={{ fill: '#333333', fontSize: '12px' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Team Rankings */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 min-h-[550px] flex flex-col">
              <div className="text-gray-500 flex-1 flex flex-col">
                <div className="text-center">
                  <div className="text-left font-bold text-base border-b border-neutral-200 pb-4 flex justify-between items-center gap-4">
                    <div className="text-lg">
                      <p className="text-left font-bold mb-1 text-gray-800">Team Rankings</p>
                    </div>
                    <div>
                      <select
                        className="bg-white border-2 border-neutral-200 p-2 text-sm rounded-md hover:cursor-pointer max-w-[160px]"
                        onChange={handleDropdownChange}
                      >
                        {data?.stats.map((stat, index) => (
                          <option key={stat.id} value={index}>
                            Week {stat.game.week} - {stat.game.short_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 py-4 scrollbar-hide border-b border-neutral-200">
                  {RankingTabsV2.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTabKey(tab.key)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeTabKey === tab.key
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="text-sm flex-1">
                  <div className="flex flex-col py-4 border-b border-neutral-200">
                    <div className="grid grid-cols-7 text-xl font-black text-[#333333]">
                      <span className="col-span-2 text-left pl-1">{teamOne || 'TBD'}</span>
                      <span className="col-span-3 text-center">vs</span>
                      <span className="col-span-2 text-right pr-1">{teamTwo || 'TBD'}</span>
                    </div>
                    <div className="grid grid-cols-7 text-xs text-neutral-600">
                      <div className="col-span-2 text-left pl-1">Rank</div>
                      <div className="col-span-3 text-center">{activeCategory?.label}</div>
                      <div className="col-span-2 text-right pr-1">Rank</div>
                    </div>
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[250px]">
                    {activeCategory?.stats.map((stat) => {
                      const t1Rank = teamOneStats?.[activeCategory.key]?.[stat.key];
                      const t2Rank = teamTwoStats?.[activeCategory.key]?.[stat.key];

                      return (
                        <div key={stat.key} className="grid grid-cols-7 items-center h-8 hover:bg-neutral-50 rounded">
                          <div className="col-span-2 flex items-center gap-2 pl-2">
                            <div className={`font-mono font-bold text-sm w-8 text-center rounded py-1`}>
                              {t1Rank}
                            </div>
                          </div>
                          <div className="col-span-3 text-center text-sm font-medium text-neutral-500 px-1">
                            {stat.label}
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                            <div className={`font-mono font-bold text-sm w-8 text-center rounded py-1`}>
                              {t2Rank}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}