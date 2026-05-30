"use client";

import React from "react";

export default function ConsistencyHeatmap({
  year = 2025,
  month = 4, // 0-indexed: 4 is May
  sessionData = {}, // Map of "YYYY-MM-DD" or day number (1-31) to session count
}) {
  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Weekdays order: 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
  const getWeekdayIndex = (day) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Row labels
  const rowLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

  // Generate grid cells
  // We have 7 rows (Mon-Sun) and daysInMonth columns
  const grid = Array.from({ length: 7 }, () => Array(daysInMonth).fill(null));

  for (let d = 1; d <= daysInMonth; d++) {
    const r = getWeekdayIndex(d);
    const c = d - 1;
    
    // Get session count for this day
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const sessions = sessionData[d] || sessionData[dateString] || 0;
    
    grid[r][c] = {
      day: d,
      sessions,
    };
  }

  // Get color class based on session count
  const getColorClass = (sessions) => {
    if (sessions === 0) return "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700";
    if (sessions === 1) return "bg-sky-200 text-sky-800 hover:bg-sky-300";
    if (sessions === 2) return "bg-sky-400 text-white hover:bg-sky-500";
    return "bg-sky-600 text-white hover:bg-sky-700"; // 3+ sessions
  };

  return (
    <div className="w-full overflow-x-auto pb-2 select-none">
      <div className="min-w-[640px] flex flex-col gap-1.5">
        {/* Days Header */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 pl-10 mb-1">
          {Array.from({ length: daysInMonth }).map((_, idx) => (
            <div key={idx} className="w-[18px] text-center">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div className="flex flex-col gap-1.5">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1.5">
              {/* Row Label */}
              <div className="w-8 text-[11px] font-bold text-slate-400 text-right pr-2 shrink-0">
                {rowLabels[rIdx]}
              </div>

              {/* Grid Cells */}
              <div className="flex items-center gap-1.5">
                {row.map((cell, cIdx) => {
                  if (!cell) {
                    // Empty spacer cell where there is no date on this weekday
                    return (
                      <div
                        key={cIdx}
                        className="w-[18px] h-[18px] rounded bg-slate-50/20 dark:bg-slate-900/10 pointer-events-none"
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={cIdx}
                      title={`Day ${cell.day}: ${cell.sessions} session${cell.sessions !== 1 ? "s" : ""}`}
                      className={`w-[18px] h-[18px] rounded transition-all duration-100 cursor-pointer flex items-center justify-center ${getColorClass(
                        cell.sessions
                      )}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
