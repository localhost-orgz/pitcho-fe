"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Info, TrendingUp } from "lucide-react";

const METRICS = [
  { key: "focus", label: "Focus", color: "#3b82f6", dashArray: "" },
  { key: "pace", label: "Pace", color: "#10b981", dashArray: "" },
  { key: "filler", label: "Filler", color: "#f59e0b", dashArray: "" },
  { key: "efficiency", label: "Clarity", color: "#8b5cf6", dashArray: "" },
];

export default function GrowthTimeline({ sessions, activeMetric, onMetricChange }) {
  const [tooltip, setTooltip] = useState(null); // { x, y, session }

  const chartWidth = 600;
  const chartHeight = 240;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  // Sessions in chronological order (oldest first) for charting
  const chronological = useMemo(() => [...sessions].reverse(), [sessions]);

  // Compute points for each metric
  const metricLines = useMemo(() => {
    if (chronological.length < 2) return {};
    const result = {};
    METRICS.forEach(({ key }) => {
      result[key] = chronological.map((session, idx) => {
        const x = padLeft + (idx / (chronological.length - 1)) * plotWidth;
        const score = session.scores[key] ?? 0;
        const y = padTop + plotHeight - (score / 100) * plotHeight;
        return { x, y, score, session };
      });
    });
    return result;
  }, [chronological, plotWidth, plotHeight]);

  // Y-axis grid lines
  const gridLines = [0, 25, 50, 75, 100];
  const yTicks = gridLines.map((v) => ({
    y: padTop + plotHeight - (v / 100) * plotHeight,
    label: v,
  }));

  // X-axis labels (show ~5 evenly spaced)
  const xLabels = useMemo(() => {
    if (chronological.length <= 1) return [];
    const count = Math.min(chronological.length, 6);
    const step = Math.max(1, Math.floor((chronological.length - 1) / (count - 1)));
    return chronological
      .filter((_, i) => i % step === 0 || i === chronological.length - 1)
      .map((session) => {
        const d = new Date(session.date);
        return {
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          x: padLeft + (chronological.indexOf(session) / (chronological.length - 1)) * plotWidth,
        };
      });
  }, [chronological, plotWidth]);

  // Build SVG path for a metric
  const buildPath = useCallback(
    (metricKey) => {
      const points = metricLines[metricKey];
      if (!points || points.length < 2) return "";
      return points
        .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
        .join(" ");
    },
    [metricLines]
  );

  // Trend line (simple linear regression through all points of active metric)
  const trendLine = useMemo(() => {
    const points = metricLines[activeMetric];
    if (!points || points.length < 2) return null;
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    points.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const x1 = padLeft;
    const y1 = slope * x1 + intercept;
    const x2 = padLeft + plotWidth;
    const y2 = slope * x2 + intercept;
    return { x1, y1, x2, y2 };
  }, [metricLines, activeMetric, plotWidth]);

  // Determine which metric improved most
  const bestMetric = useMemo(() => {
    if (chronological.length < 5) return null;
    const first5 = chronological.slice(0, 5);
    const last5 = chronological.slice(-5);
    const improvements = METRICS.map(({ key, label }) => {
      const firstAvg = first5.reduce((s, r) => s + (r.scores[key] ?? 0), 0) / first5.length;
      const lastAvg = last5.reduce((s, r) => s + (r.scores[key] ?? 0), 0) / last5.length;
      return { key, label, diff: Math.round(lastAvg - firstAvg) };
    });
    improvements.sort((a, b) => b.diff - a.diff);
    return improvements[0];
  }, [chronological]);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.closest("svg")?.getBoundingClientRect();
      if (!rect) return;
      const svgX = e.clientX - rect.left;
      // Find nearest point for active metric
      const points = metricLines[activeMetric];
      if (!points) return;
      let nearest = points[0];
      let minDist = Infinity;
      points.forEach((p) => {
        const dist = Math.abs(p.x - svgX);
        if (dist < minDist) {
          minDist = dist;
          nearest = p;
        }
      });
      if (minDist < 30) {
        setTooltip({
          x: nearest.x,
          y: nearest.y,
          session: nearest.session,
          score: nearest.score,
        });
      } else {
        setTooltip(null);
      }
    },
    [metricLines, activeMetric]
  );

  // Empty state
  if (chronological.length < 2) {
    return (
      <div className="bg-white rounded-2xl border-bold px-5 py-5 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <TrendingUp size={40} className="text-slate-200" />
        <p className="text-sm font-bold text-slate-400 text-center max-w-xs">
          Complete at least 2 sessions to see your growth timeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-bold px-5 py-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
          How You&apos;re Improving
          <Info size={14} className="text-slate-400 cursor-help" />
        </h3>

        {/* Metric toggle buttons */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5 border border-slate-200">
          {METRICS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => onMetricChange(key)}
              className="px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              style={
                activeMetric === key
                  ? { backgroundColor: color, color: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }
                  : { color: "#94a3b8" }
              }
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: activeMetric === key ? "white" : color }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible select-none w-full min-w-[500px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick.label}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={chartWidth - padRight}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={padLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize={10}
                fontWeight={700}
                fill="#94a3b8"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Inactive metric lines (dimmed) */}
          {METRICS.map(({ key, color }) => {
            if (key === activeMetric) return null;
            const path = buildPath(key);
            if (!path) return null;
            return (
              <path
                key={key}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Active metric line */}
          {(() => {
            const activePath = buildPath(activeMetric);
            if (!activePath) return null;
            const activeColor = METRICS.find((m) => m.key === activeMetric)?.color || "#0388ff";
            return (
              <>
                {/* Gradient area */}
                <defs>
                  <linearGradient id={`areaGrad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <path
                  d={`${activePath} L ${padLeft + plotWidth} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`}
                  fill={`url(#areaGrad-${activeMetric})`}
                />
                <path
                  d={activePath}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {metricLines[activeMetric]?.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill={activeColor}
                    stroke="white"
                    strokeWidth={1.5}
                    className="cursor-pointer"
                  />
                ))}
              </>
            );
          })()}

          {/* Trend line */}
          {trendLine && (
            <line
              x1={trendLine.x1}
              y1={trendLine.y1}
              x2={trendLine.x2}
              y2={trendLine.y2}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              strokeOpacity={0.6}
            />
          )}

          {/* X-axis labels */}
          {xLabels.map((xl, i) => (
            <text
              key={i}
              x={xl.x}
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="#94a3b8"
            >
              {xl.label}
            </text>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <line
                x1={tooltip.x}
                y1={padTop}
                x2={tooltip.x}
                y2={padTop + plotHeight}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <rect
                x={Math.min(Math.max(tooltip.x - 50, 0), chartWidth - 110)}
                y={Math.max(tooltip.y - 40, 0)}
                width={100}
                height={32}
                rx={8}
                fill="white"
                stroke="#e2e8f0"
                strokeWidth={1}
                filter="url(#shadow)"
              />
              <defs>
                <filter id="shadow">
                  <feDropShadow dx={0} dy={2} stdDeviation={3} floodOpacity={0.1} />
                </filter>
              </defs>
              <text
                x={Math.min(Math.max(tooltip.x, 50), chartWidth - 60)}
                y={Math.max(tooltip.y - 22, 12)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={900}
                fill="#1e293b"
              >
                {tooltip.score}%
              </text>
              <text
                x={Math.min(Math.max(tooltip.x, 50), chartWidth - 60)}
                y={Math.max(tooltip.y - 8, 26)}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="#94a3b8"
              >
                {tooltip.session?.formattedDate || ""}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Insight annotation */}
      {bestMetric && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
          <TrendingUp size={14} />
          <span>
            {bestMetric.label} improved the most ({bestMetric.diff > 0 ? "+" : ""}
            {bestMetric.diff} points) across all sessions
          </span>
        </div>
      )}
    </div>
  );
}
