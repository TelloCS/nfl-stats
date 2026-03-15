export default function CustomizedAxisTick({ x, y, payload, stats }) {
  const item = stats?.[payload.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle">
        <tspan x="0" dy="1.2em" style={{ fontSize: '11px', fill: '#a1a1a1', fontWeight: 500 }}>
          {payload.value}
        </tspan>
        <tspan x="0" dy="1.2em" style={{ fontSize: '10px', fill: '#a1a1a1', fontWeight: 500 }}>
          {item?.game?.short_name}
        </tspan>
      </text>
    </g>
  );
};