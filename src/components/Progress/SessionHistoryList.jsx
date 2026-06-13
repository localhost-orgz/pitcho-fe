"use client";

import React, { useMemo } from "react";
import { Clock, FileText } from "lucide-react";

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "highest", label: "Highest Score" },
  { key: "longest", label: "Longest" },
];

function scoreToColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

function formatDuration(seconds) {
  if (!seconds) return "0 detik";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s} detik`;
  return `${m} menit ${s} detik`;
}

export default function SessionHistoryList({ sessions, averageScores }) {
  const [sortBy, setSortBy] = React.useState("newest");

  const sortedSessions = useMemo(() => {
    const sorted = [...sessions];
    switch (sortBy) {
      case "highest":
        sorted.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case "longest":
        sorted.sort((a, b) => b.duration - a.duration);
        break;
      default: // newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
  }, [sessions, sortBy]);

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-bold px-5 py-10 flex flex-col items-center gap-3">
        <FileText size={40} className="text-slate-200" />
        <p className="text-sm font-bold text-slate-400 text-center">
          No sessions yet — your first one awaits!
        </p>
        <a
          href="/presentation/setup"
          className="text-xs font-extrabold text-main hover:underline"
        >
          Start Your First Practice →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-bold flex flex-col">
      {/* Header with sort controls */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Session History
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                sortBy === opt.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session rows */}
      <div className="divide-y divide-slate-50">
        {sortedSessions.map((session) => {
          const isPresentation =
            String(session.mode).toLowerCase() === "presentation";
          const modeColor = isPresentation
            ? "bg-blue-50 text-blue-600 border-blue-200"
            : "bg-purple-50 text-purple-600 border-purple-200";

          return (
            <a
              key={session.id}
              href={`/session/${session.id}`}
              className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer text-left no-underline text-inherit group"
            >
              {/* Date */}
              <span className="text-xs font-bold text-slate-600 w-[85px] shrink-0">
                {session.formattedDate}
              </span>

              {/* Mode badge */}
              <span
                className={`text-[10px] font-extrabold py-0.5 rounded-full border shrink-0 text-center w-[96px] ${modeColor}`}
              >
                {isPresentation
                  ? "Presentation"
                  : String(session.mode).toLowerCase() === "interview"
                    ? "Interview"
                    : session.mode
                      ? session.mode.charAt(0).toUpperCase() + session.mode.slice(1).toLowerCase()
                      : "Interview"}
              </span>

              {/* Session name */}
              <span className="text-xs font-bold text-slate-700 truncate min-w-0 flex-1">
                {session.topic || session.name || "Untitled"}
              </span>

              {/* Score */}
              <div className="flex items-center gap-1 shrink-0 w-[60px]">
                <span
                  className="text-sm font-black"
                  style={{ color: scoreToColor(session.overallScore) }}
                >
                  {session.overallScore}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">/100</span>
              </div>

              {/* Duration */}
              <span className="text-[10px] text-slate-400 font-bold shrink-0 flex items-center gap-1 w-[110px] justify-end">
                <Clock size={10} />
                {formatDuration(session.duration)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
