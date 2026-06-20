interface TempChartProps {
  data: { time: string; value: number }[];
  targetMin?: number;
  targetMax?: number;
  height?: number;
}

export function TempChart({ data, targetMin, targetMax, height = 160 }: TempChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const allValues = [...values];
  if (targetMin !== undefined) allValues.push(targetMin);
  if (targetMax !== undefined) allValues.push(targetMax);

  const minVal = Math.min(...allValues) - 1;
  const maxVal = Math.max(...allValues) + 1;

  const yScale = (val: number) =>
    padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  const xScale = (i: number) =>
    padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;

  const points = data
    .map((d, i) => `${xScale(i)},${yScale(d.value)}`)
    .join(' ');

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minVal + (i * (maxVal - minVal)) / yTicks
  );

  const timeLabels = data
    .filter((_, i) => i % 6 === 0 || i === data.length - 1)
    .map((d) => ({
      x: xScale(data.indexOf(d)),
      label: new Date(d.time).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      {yTickValues.map((val, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={yScale(val)}
            x2={width - padding.right}
            y2={yScale(val)}
            stroke="#e2e8f0"
            strokeDasharray="2 2"
          />
          <text
            x={padding.left - 8}
            y={yScale(val) + 4}
            textAnchor="end"
            className="fill-slate-400"
            fontSize="10"
          >
            {val.toFixed(0)}°C
          </text>
        </g>
      ))}

      {targetMax !== undefined && (
        <line
          x1={padding.left}
          y1={yScale(targetMax)}
          x2={width - padding.right}
          y2={yScale(targetMax)}
          stroke="#f43f5e"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}
      {targetMin !== undefined && (
        <line
          x1={padding.left}
          y1={yScale(targetMin)}
          x2={width - padding.right}
          y2={yScale(targetMin)}
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}

      <polyline
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />

      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(d.value)}
          r="3"
          fill="#0ea5e9"
        />
      ))}

      {timeLabels.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={height - 8}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="10"
        >
          {t.label}
        </text>
      ))}
    </svg>
  );
}
