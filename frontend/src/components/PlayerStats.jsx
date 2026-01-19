import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  BarChart, Legend, XAxis, YAxis, CartesianGrid, 
  Tooltip, Bar, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { PositionStatMap } from './Config';
import Layout from "../pages/Layout";
import UpcomingGames from "./UpcomingGames";

const PlayerStats = () => {
  const { player_id, player_slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState({ stats: [], fullName: '', position: '' });
  const [statsToShow, setStatsToShow] = useState([]);
  const [activeStat, setActiveStat] = useState("");

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`/nfl/player/stats/id/${player_id}/${player_slug}`);
        const data = await resp.json();
        setPlayerData(data);
        
        const availableStats = PositionStatMap[data.position] || [];
        setStatsToShow(availableStats);
        if (availableStats.length > 0) setActiveStat(availableStats[0].key);
      } catch (err) {
        console.error("Error fetching player data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerStats();
  }, [player_id, player_slug]);

  // 1. Calculate the average for the ReferenceLine
  const averageValue = useMemo(() => {
    if (!playerData.stats || playerData.stats.length === 0) return 0;
    const sum = playerData.stats.reduce((acc, curr) => acc + (Number(curr[activeStat]) || 0), 0);
    return sum / playerData.stats.length;
  }, [playerData.stats, activeStat]);

  // 2. Calculate the MINIMUM width needed for readability
  // This ensures that on mobile, the chart scrolls instead of squashing.
  // 70px per game is a good "readable" sweet spot.
  const minChartWidth = useMemo(() => {
    return Math.max((playerData.stats?.length || 0) * 70, 300);
  }, [playerData.stats]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <UpcomingGames />
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        
        {/* Player Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 4px 0', color: '#111827' }}>{playerData.fullName}</h1>
          <span style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '4px 12px', 
            borderRadius: '99px', 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: '#4b5563'
          }}>
            {playerData.position}
          </span>
        </div>

        {/* Stat Selection Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px', 
          overflowX: 'auto', 
          paddingBottom: '8px' 
        }}>
          {statsToShow.map((stat) => (
            <button 
              key={stat.key}
              onClick={() => setActiveStat(stat.key)}
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeStat === stat.key ? '#4f46e5' : '#e5e7eb',
                backgroundColor: activeStat === stat.key ? '#4f46e5' : '#fff',
                color: activeStat === stat.key ? '#fff' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.15s ease'
              }}
            >
              {stat.label}
            </button>
          ))}
        </div>

        {/* CHART CONTAINER FIX:
            'overflowX: auto' allows scrolling on mobile.
            The inner div uses 'minWidth' to prevent squashing, 
            but 'width: 100%' to fill the desktop screen.
        */}
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ minWidth: `${minChartWidth}px`, width: '100%', height: '450px', padding: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={playerData.stats}
                margin={{ top: 20, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                
                <XAxis 
                  dataKey="game.date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  dy={10}
                />
                
                <YAxis 
                  width={45} // Prevents Y-axis labels from disappearing on refresh
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />

                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                />

                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ paddingBottom: '20px', fontWeight: '500' }}
                />

                <ReferenceLine 
                  y={averageValue} 
                  stroke="#d97706" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `AVG: ${averageValue.toFixed(1)}`, 
                    position: 'top', 
                    fill: '#d97706', 
                    fontSize: 12,
                    fontWeight: 'bold' 
                  }} 
                />

                <Bar 
                  name={statsToShow.find(s => s.key === activeStat)?.label || "Value"}
                  dataKey={activeStat} 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]} 
                  barSize={Math.min(minChartWidth / (playerData.stats.length || 1) * 0.6, 40)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerStats;