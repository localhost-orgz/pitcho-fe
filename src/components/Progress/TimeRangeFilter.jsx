"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RANGES = [
  { key: "all", label: "All Time" },
  { key: "3months", label: "Last 3 Months" },
  { key: "month", label: "This Month" },
  { key: "week", label: "This Week" },
];

const MODES = [
  { key: "all", label: "All" },
  { key: "presentation", label: "Presentation" },
  { key: "interview", label: "Interview" },
];

export default function TimeRangeFilter({
  range,
  onRangeChange,
  year,
  monthIndex,
  onMonthChange,
  mode,
  onModeChange,
}) {
  const showMonthNav = range === "month" || range === "3months";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Time range pills */}
      <div className="flex items-center bg-white rounded-xl p-1 border-2 border-slate-200 gap-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => onRangeChange(r.key)}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              range === r.key
                ? "bg-main text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Month navigation */}
        {showMonthNav && (
          <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border-bold">
            <button
              onClick={() => onMonthChange(-1)}
              className="p-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-slate-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-extrabold text-slate-700 min-w-[120px] text-center">
              {MONTHS[monthIndex]} {year}
            </span>
            <button
              onClick={() => onMonthChange(1)}
              className="p-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-slate-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Mode filter */}
        <div className="flex items-center bg-white rounded-xl p-1 border-2 border-slate-200 gap-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                mode === m.key
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
