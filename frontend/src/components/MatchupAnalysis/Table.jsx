import { memo } from "react"
import { TeamRankingStatMap } from "../Config";
import StatRow from "../UpcomingMatchup/StatRow";

const Table = ({ data, teamOne, teamTwo, statLabel }) => {

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-geodude-950 border border-geodude-800 rounded-xl p-4">
        <p className="text-base font-bold text-foreground mb-4 text-center tracking-wide">
          {statLabel}
        </p>

        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 text-center items-center p-1.5 border-b border-geodude-800 mb-3">
              <span className="text-primary font-bold text-base">{teamOne}</span>
              <span className="text-xs font-black tracking-widest text-paper-500 uppercase">vs</span>
              <span className="text-status-error font-bold text-base">{teamTwo}</span>
            </div>
            {data.map((item, idx) => (
              <StatRow
                key={idx}
                label={(item.subject) || '--'}
                playerVal={(item[teamOne]) || '--'}
                opponentVal={(item[teamTwo]) || '--'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Table);