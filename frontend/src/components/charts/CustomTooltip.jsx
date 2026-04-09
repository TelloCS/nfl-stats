export default function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#171717] p-3 border border-[#252525] rounded-lg text-center">
        <p className="text-[#a1a1a1] text-sm mb-1">{data.game?.date}</p>
        <p className="text-[#009966] text-sm">
          {payload[0].name}: <span>{payload[0].value}</span>
        </p>
        <p className="text-[#a1a1a1] text-[12px]">{data.game?.short_name}</p>
      </div>
    );
  }
  return null;
};