import { memo } from "react";
import { STAT_TYPES } from "../Config";

const getStatPrefix = (dataKey) => {
  if (STAT_TYPES.VOLUME?.includes(dataKey)) return 'SUM';
  if (STAT_TYPES.MAX?.includes(dataKey)) return 'MAX';
  if (STAT_TYPES.DERIVED?.includes(dataKey)) return 'DERIVED';

  return '';
}


function CustomTooltip({ active, payload, showStatPrefixes = false }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-geodude-800 p-3 border border-geodude-800 rounded-lg text-center min-w-[150px]">
        <p className="text-paper-400 text-sm mb-2 font-semibold">{data.game?.date}</p>
        {data.game?.short_name && (
          <p className="text-paper-400 text-[12px] mb-2 font-bold">{data.game.short_name}</p>
        )}

        <hr className="border-geodude-700 my-2" />

        <div className="space-y-1 text-left">
          {payload.map((item, index) => {
            const prefix = showStatPrefixes ? getStatPrefix(item.dataKey) : '';
            const displayName = prefix ? `${prefix} (${item.name})` : `${item.name}:`;

            return (
              <p key={index} className="text-sm flex justify-between gap-4" style={{ color: item.stroke || item.fill }}>
                <span>{displayName}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export default memo(CustomTooltip);