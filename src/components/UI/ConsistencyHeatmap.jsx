"use client";

import React, { useState, useRef } from "react";

// ── GitHub green palette (light + dark) ──────────────────────
const LEVEL_COLORS = {
  0: "bg-[#ebedf0] dark:bg-[#2d333b]",
  1: "bg-[#9be9a8] dark:bg-[#0e4429]",
  2: "bg-[#40c463] dark:bg-[#006d32]",
  3: "bg-[#30a14e] dark:bg-[#26a641]",
  4: "bg-[#216e39] dark:bg-[#39d353]",
};

const ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CELL_SIZE = 12;
const CELL_GAP = 3;

// ── Helpers ──────────────────────────────────────────────────

/** Monday-based weekday index: 0=Mon … 6=Sun */
function getMondayIndex(date) {
  const d = date.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  return d === 0 ? 6 : d - 1;
}

/** Local‑timezone‑safe date → "YYYY‑MM‑DD" */
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Total seconds → human readable */
function formatDuration(totalSeconds) {
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

/** "2026-06-12" → "Fri, Jun 12, 2026" */
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Map total seconds → level 0‑4 */
function getLevel(totalSeconds) {
  if (totalSeconds === 0) return 0;
  if (totalSeconds <= 300) return 1;   // 1–5 min
  if (totalSeconds <= 600) return 2;   // 6–10 min
  if (totalSeconds <= 1200) return 3;  // 11–20 min
  return 4;                             // 20+ min
}

/** Is `year` a leap year? */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// ── Component ────────────────────────────────────────────────

// ── Skeleton loader ────────────────────────────────────────────
function HeatmapSkeleton() {
  const skeletonWeeks = 53;
  const CELL_SIZE = 12;
  const CELL_GAP = 3;

  return (
    <div className="relative select-none overflow-visible animate-pulse">
      <div className="overflow-x-auto pb-1">
        <div
          className="flex flex-col"
          style={{ minWidth: skeletonWeeks * (CELL_SIZE + CELL_GAP) + 32 }}
        >
          {/* Month labels skeleton */}
          <div
            className="flex mb-[2px]"
            style={{ paddingLeft: 32, gap: CELL_GAP }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 w-6 bg-slate-200 rounded shrink-0"
                style={{ marginRight: (CELL_SIZE + CELL_GAP) * 3 }}
              />
            ))}
          </div>

          {/* Day rows skeleton */}
          <div className="flex flex-col" style={{ gap: CELL_GAP }}>
            {Array.from({ length: 7 }).map((_, rIdx) => (
              <div
                key={rIdx}
                className="flex items-center"
                style={{ gap: CELL_GAP }}
              >
                {/* Row label skeleton */}
                <div
                  className="h-2.5 w-5 bg-slate-100 rounded shrink-0"
                  style={{ marginRight: 32 - CELL_GAP - 20, width: 20 }}
                />

                {/* Week cells skeleton */}
                {Array.from({ length: skeletonWeeks }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className="shrink-0 rounded-sm bg-slate-100"
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center justify-end gap-1 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 w-8 bg-slate-100 rounded shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsistencyHeatmap({
  year = new Date().getFullYear(),
  dailyData = {},
  loading = false,
}) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  if (loading) return <HeatmapSkeleton />;

  // ── Build the 7‑row × N‑week grid ─────────────────────────
  const startOfYear = new Date(year, 0, 1);               // Jan 1
  const startDayOfWeek = getMondayIndex(startOfYear);      // Mon‑based
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const totalWeeks = Math.ceil((daysInYear + startDayOfWeek) / 7);

  // 7 rows (Mon‑Sun), each with totalWeeks columns
  const grid = Array.from({ length: 7 }, () => Array(totalWeeks).fill(null));

  for (let day = 1; day <= daysInYear; day++) {
    const date = new Date(year, 0, day); // month 0 = Jan, day = 1‑based
    const dateStr = formatLocalDate(date);
    const weekday = getMondayIndex(date);
    const weekIndex = Math.floor((day - 1 + startDayOfWeek) / 7);
    const seconds = dailyData[dateStr] || 0;

    grid[weekday][weekIndex] = {
      date: dateStr,
      seconds,
      level: getLevel(seconds),
    };
  }

  // ── Month label positions ──────────────────────────────────
  const monthLabelRow = Array(totalWeeks).fill(null);
  const seenWeeks = new Set();

  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1);
    const dayOfYear =
      Math.floor((firstDay - startOfYear) / 86400000) + 1;
    const weekIndex = Math.floor((dayOfYear - 1 + startDayOfWeek) / 7);

    // Deduplicate: if multiple months start in the same week, only label the first
    if (!seenWeeks.has(weekIndex)) {
      seenWeeks.add(weekIndex);
      monthLabelRow[weekIndex] = MONTH_ABBR[m];
    }
  }

  // ── Tooltip handlers ──────────────────────────────────────
  const handleMouseEnter = (e, cell) => {
    if (!containerRef.current) return;
    const cellRect = e.target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setTooltip({
      date: cell.date,
      seconds: cell.seconds,
      x: cellRect.left - containerRect.left + cellRect.width / 2,
      y: cellRect.top - containerRect.top - 6,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      data-heatmap-container
      className="relative select-none overflow-visible"
    >
      {/* ── Tooltip ────────────────────────────────────────── */}
      {tooltip && (
        <div
          className="absolute z-50 px-2.5 py-1.5 rounded-md bg-[#1b1f23] text-white text-xs font-semibold shadow-lg pointer-events-none whitespace-nowrap -translate-x-1/2"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.seconds > 0
            ? `${formatDuration(tooltip.seconds)} on ${formatDateLabel(tooltip.date)}`
            : `No activity on ${formatDateLabel(tooltip.date)}`}
        </div>
      )}

      {/* ── Scrollable grid area ───────────────────────────── */}
      <div className="overflow-x-auto pb-1">
        <div className="flex flex-col" style={{ minWidth: totalWeeks * (CELL_SIZE + CELL_GAP) + 32 }}>
          {/* Month labels */}
          <div
            className="flex text-[10px] text-slate-400 font-semibold mb-[2px]"
            style={{ paddingLeft: 32 }}
          >
            {monthLabelRow.map((label, i) => (
              <div
                key={i}
                className="shrink-0 flex items-end"
                style={{ width: CELL_SIZE + CELL_GAP, height: 16 }}
              >
                {label && <span>{label}</span>}
              </div>
            ))}
          </div>

          {/* Day rows */}
          <div className="flex flex-col" style={{ gap: CELL_GAP }}>
            {grid.map((row, rIdx) => (
              <div
                key={rIdx}
                className="flex items-center"
                style={{ gap: CELL_GAP }}
              >
                {/* Row label */}
                <div
                  className="text-[10px] text-slate-400 font-semibold text-right shrink-0"
                  style={{ width: 32 - CELL_GAP, paddingRight: CELL_GAP }}
                >
                  {ROW_LABELS[rIdx]}
                </div>

                {/* Week cells */}
                {row.map((cell, cIdx) => {
                  if (!cell) {
                    // Empty spacer (before Jan 1 or after Dec 31)
                    return (
                      <div
                        key={cIdx}
                        className="shrink-0 rounded-sm pointer-events-none invisible"
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    );
                  }

                  const colorClass = LEVEL_COLORS[cell.level];

                  return (
                    <div
                      key={cIdx}
                      onMouseEnter={(e) => handleMouseEnter(e, cell)}
                      onMouseLeave={handleMouseLeave}
                      className={`shrink-0 rounded-sm cursor-pointer transition-colors hover:ring-2 hover:ring-slate-400 hover:ring-offset-1 ${colorClass}`}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400 font-semibold">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={`shrink-0 rounded-sm ${LEVEL_COLORS[level]}`}
                style={{ width: 10, height: 10 }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
