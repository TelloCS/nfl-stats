export default function CustomizedAxisTick({ x, y, payload, stats }) {
  const item = stats?.[payload.index];
  const shortName = item?.game?.short_name || "";
  const shortNameArray = shortName.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="middle">
        {shortNameArray.map((word, index) => (
          <tspan
            key={index}
            x="0"
            dy="1.2em"
            style={{
              fontSize: '11px',
              fill: word === '@' ? '#666' : '#a1a1a1',
              fontWeight: 500
            }}
          >
            {word}
          </tspan>
        ))}
        <tspan
          x="0"
          dy="1.2em"
          style={{ fontSize: '11px', fill: '#a1a1a1', fontWeight: 500 }}
        >
          {payload.value}
        </tspan>
      </text>
    </g>
  );
}