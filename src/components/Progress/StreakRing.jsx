"use client";

import React from "react";
import { Flame, Trophy, Check, X, Shield } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────

/** Pick motivational text based on streak length */
function getMotivationalText(current, practicedToday) {
  if (!practicedToday && current > 0) {
    return "Don't break your streak — practice today! 🔥";
  }
  if (current >= 30) return "Unstoppable! What a legendary streak! 🔥";
  if (current >= 14) return "You're on fire! Keep the momentum going!";
  if (current >= 7) return "One week strong! Keep showing up! 💪";
  if (current >= 3) return "Building momentum! You're doing great!";
  if (current >= 1) return "Great start! Come back tomorrow!";
  return "Start your streak today!";
}

// ── Day cell sub-component ───────────────────────────────────

function DayCell({ day, status }) {
  // Done (past)
  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-[10px] font-bold text-slate-400">{day}</span>
      </div>
    );
  }

  // Today — practiced
  if (status === "today-done") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md ring-2 ring-emerald-200 ring-offset-1">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-[10px] font-extrabold text-emerald-600">{day}</span>
      </div>
    );
  }

  // Today — not yet practiced
  if (status === "today-pending") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center animate-pulse">
          <Flame size={15} className="text-amber-500 fill-amber-400" />
        </div>
        <span className="text-[10px] font-extrabold text-amber-600">{day}</span>
      </div>
    );
  }

  // Missed
  if (status === "missed") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <X size={12} className="text-slate-300" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-slate-300">{day}</span>
      </div>
    );
  }

  // Future / unknown
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center" />
      <span className="text-[10px] font-bold text-slate-200">{day}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────

export default function StreakRing({
  current = 0,
  best = 0,
  practicedToday = false,
  weeklyHistory = [],
}) {
  const motivationalText = getMotivationalText(current, practicedToday);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Title */}
      <h3 className="font-extrabold text-slate-800 text-sm">Streak</h3>

      {/* ── Top row: Flame counter + Best streak ────────────── */}
      <div className="flex items-center justify-between">
        {/* Flame + count */}
        <div className="flex items-center gap-3">
          {/* Flame icon in orange circle */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
            <Flame
              size={24}
              className="text-white fill-white"
              style={current > 0 ? { animation: "bounce 1s infinite" } : undefined}
            />
          </div>

          {/* Count + label */}
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {current}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              day streak
            </span>
          </div>
        </div>

        {/* Best streak */}
        <div className="flex flex-col items-center bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
          <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xs">
            <Trophy size={12} className="fill-amber-300 text-amber-600" />
            <span>{best}</span>
          </div>
          <span className="text-[9px] font-bold text-amber-400">best</span>
        </div>
      </div>

      {/* ── Motivational text ───────────────────────────────── */}
      <p className="text-xs font-bold text-slate-500 leading-relaxed">
        {motivationalText}
      </p>

      {/* ── 7-day mini calendar ─────────────────────────────── */}
      {weeklyHistory.length === 7 && (
        <div className="flex items-center justify-between px-1">
          {weeklyHistory.map((entry, i) => (
            <DayCell key={i} day={entry.day} status={entry.status} />
          ))}
        </div>
      )}

      {/* ── Today status banner ─────────────────────────────── */}
      {practicedToday ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-emerald-700">
              You practiced today!
            </span>
            <span className="text-[10px] font-semibold text-emerald-500">
              Streak secured — see you tomorrow!
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center shrink-0">
            <Flame size={16} className="text-amber-500 fill-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-amber-700">
              Practice today to keep your streak!
            </span>
            <span className="text-[10px] font-semibold text-amber-500">
              Just one session — you&apos;ve got this!
            </span>
          </div>
        </div>
      )}

      {/* ── Action buttons ──────────────────────────────────── */}
      {current >= 3 && (
        <button className="flex items-center justify-center gap-1.5 w-full text-[11px] font-extrabold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 transition-colors cursor-pointer">
          <Shield size={12} />
          Freeze streak
        </button>
      )}
    </div>
  );
}
