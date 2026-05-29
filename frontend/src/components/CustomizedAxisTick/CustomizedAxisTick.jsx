import { memo } from 'react';

function CustomizedAxisTick({ x, y, payload, stats }) {
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
              fontSize: '10px',
              fill: word === '@' ? 'var(--app-paper-500)' : 'var(--app-paper-400)',
              fontWeight: 500
            }}
          >
            {word}
          </tspan>
        ))}
        <tspan
          x="0"
          dy="1.4em"
          style={{ fontSize: '10px', fill: 'var(--app-paper-400)', fontWeight: 500 }}
        >
          {payload.value}
        </tspan>
      </text>
    </g>
  );
}

export default memo(CustomizedAxisTick);