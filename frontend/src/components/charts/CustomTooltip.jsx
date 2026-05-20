export default function CustomTooltip({ active, payload }) {
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
          {payload.map((item, index) => (
            <p key={index} className="text-sm flex justify-between gap-4" style={{ color: item.stroke }}>
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}