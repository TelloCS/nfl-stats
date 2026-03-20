import { useState, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { TeamRankingStatMap } from "./Config";
import StatToggle from "./ui/StatToggle";
import SelectDropdown from "./ui/SelectDropdown"; 
import { getMatchupTeams, generateRadarData } from "../utils/chartDataTransformers"; 

export default function MatchupAnalysisSection({ games, rankingData }) {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState(TeamRankingStatMap[0].key);

  const { teamOne, teamTwo } = useMemo(() => getMatchupTeams(games?.[selectedGameIndex]), 
    [games, selectedGameIndex]
  );

  const radarData = useMemo(() => generateRadarData(activeTabKey, rankingData, teamOne, teamTwo),
    [activeTabKey, rankingData, teamOne, teamTwo]
  );

  const gameOptions = useMemo(() => {
    if (!games) return [];
    return games.map((stat, index) => ({
      value: index,
      label: `Week ${stat.game.week} - ${stat.game.short_name}`
    }));
  }, [games]);

  if (!games || games.length === 0) return null;

  return (
    <div className="bg-neutral-900 p-6 rounded-md border border-neutral-800 h-[550px] flex flex-col">
      <div className="flex justify-between items-center mb-4 min-h-[39px]">
        <div>
          <span className="font-semibold text-white text-lg">Matchups</span>
          <p class="text-xs text-[#a1a1a1] italic">Only Current Season</p>
        </div>
        
        <SelectDropdown 
          value={selectedGameIndex} 
          onChange={setSelectedGameIndex} 
          options={gameOptions} 
          minWidth="120px"
        />
      </div>

      <StatToggle
        options={TeamRankingStatMap}
        activeKey={activeTabKey}
        onSelect={setActiveTabKey}
      />

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#a1a1a1" opacity={0.3} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 11, fontWeight: 500, fill: '#a1a1a1' }} 
            />
            <PolarRadiusAxis angle={30} domain={[32, 1]} tick={false} axisLine={false} />
            <Radar 
              name={teamOne} 
              dataKey={teamOne} 
              stroke="#009966"
              fill="#009966" 
              fillOpacity={0.5} 
            />
            <Radar 
              name={teamTwo} 
              dataKey={teamTwo} 
              stroke="#a1a1a1"
              fill="#a1a1a1" 
              fillOpacity={0.3} 
            />
            <Tooltip 
              cursor={{ fill: '#262626' }}
              contentStyle={{ backgroundColor: '#171717', borderRadius: '8px', border: '1px solid #252525', color: '#a1a1a1' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '10px', color: '#a1a1a1' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}