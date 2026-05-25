import React from "react";

export default function PerformanceCircle({
  value = 0,
  color = "#10b981", // default emerald/green
  size = 72,         // circle dimension in pixels
  strokeWidth = 6,   // track border thickness
  className = ""
}) {
  // Ensure value is bounded between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // SVG dimensions calculations
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track circle (Background circle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="stroke-slate-100 fill-none dark:stroke-slate-800"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-none transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Score label inside circle */}
      <span className="text-lg font-black text-slate-800 dark:text-slate-100 z-1 leading-none tracking-tight">
        {normalizedValue}
      </span>
    </div>
  );
}
