import { memo } from "react";
import { Link } from "react-router-dom";

export const PlayerPositionGroup = memo(({ players = [], position }) => {
  if (!players || players.length === 0) return null;

  return (
    <div className="flex flex-col bg-geodude-900 text-foreground">
      <div className="bg-geodude-800 px-4 py-2 border-b border-geodude-800">
        <span className="text-lg font-bold tracking-wide">{position}</span>
      </div>
      
      <div className="flex flex-col bg-geodude-950 divide-y divide-geodude-800">
        {players.map((player) => (
          <div key={player?.id} className="flex items-center gap-3 p-2 hover:bg-geodude-800/30 transition-colors">
            <div className="w-8 text-center text-sm font-semibold text-paper-500">
              {player?.jersey ? `#${player.jersey}` : "-"}
            </div>
            
            <Link 
              to={`/players/${player.id}/${player.slug}/stats`} 
              className="flex-1 hover:text-status-info transition-colors truncate"
            >
              {player?.fullName}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
});