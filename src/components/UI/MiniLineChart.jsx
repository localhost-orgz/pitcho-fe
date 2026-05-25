import React, { useId } from "react";

export default function MiniLineChart({
  data = [],
  color = "#10b981", // default color
  strokeWidth = 2,
  className = ""
}) {
  const gradientId = useId();

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Add 10% padding top and bottom so the line doesn't hit the edges
  const padding = range * 0.1;
  const minVal = min - padding;
  const maxVal = max + padding;
  const adjustedRange = maxVal - minVal;

  const width = 120;
  const height = 40;

  // Calculate coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    // Map val to y: higher value means lower y coordinate (towards the top)
    const y = height - ((val - minVal) / adjustedRange) * (height - 6) - 3;
    return { x, y };
  });

  // Construct SVG paths
  const linePath = points.reduce((acc, pt, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
  }, "");

  const areaPath = linePath + ` L ${width} ${height} L 0 ${height} Z`;

  // Get the last point coordinates to draw an indicator dot
  const lastPt = points[points.length - 1];

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>

      {/* HTML Dot Point Indicators to prevent aspect-ratio stretching */}
      {points.map((pt, idx) => {
        const leftPercent = (pt.x / width) * 100;
        const topPercent = (pt.y / height) * 100;
        return (
          <div
            key={idx}
            className="absolute rounded-full border border-white shadow-xs pointer-events-none"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: color,
              width: "5.5px",
              height: "5.5px",
              borderWidth: "1px",
            }}
          />
        );
      })}
    </div>
  );
}
