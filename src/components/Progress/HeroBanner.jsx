"use client";

import React from "react";
import { TrendingUp, Flame, Mic, Trophy, Sparkles } from "lucide-react";
import PerformanceCircle from "@/components/UI/PerformanceCircle";

function scoreToColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 85%, 50%)`;
}

export default function HeroBanner({ summary, growth, level, streak }) {
  const { overallScore, grade, totalSessions, totalPracticeMinutes } = summary;
  const { overallImprovement, trendDirection } = growth;
  const xpPercent = level.xpToNext > 0 ? Math.round((level.xp / level.xpToNext) * 100) : 100;

  const trendIcon =
    trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→";
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-500"
      : trendDirection === "down"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border-bold border-indigo-100 px-5 md:px-8 py-6">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Left: Overall Grade + Score Ring */}
        <div className="flex items-center gap-4 shrink-0">
          <PerformanceCircle
            value={overallScore}
            color={scoreToColor(overallScore)}
            size={80}
            strokeWidth={7}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                Grade {grade}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Overall Performance
            </span>
          </div>
        </div>

        {/* Center: Growth Stat */}
        <div className="flex flex-col items-start lg:items-center lg:mx-auto">
          <div className={`flex items-center gap-1.5 ${trendColor}`}>
            <TrendingUp size={22} className={trendDirection === "up" ? "" : trendDirection === "down" ? "rotate-180" : ""} />
            <span className="text-2xl font-black">
              {trendIcon} {Math.abs(overallImprovement)}%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 mt-0.5">
            {trendDirection === "up"
              ? "Improved since your first session"
              : trendDirection === "down"
                ? "Keep practicing to get back on track"
                : "Steady progress — keep it up!"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {totalSessions} sessions · {totalPracticeMinutes} min total practice
          </span>
        </div>

        {/* Right: Level XP + Streak */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Level + XP */}
          <div className="flex flex-col items-center gap-1.5">
            {/* Level hex badge */}
            <div className="relative flex items-center justify-center w-14 h-14 bg-indigo-600 text-white font-extrabold rounded-lg shadow-md">
              <div className="text-center z-10">
                <span className="text-[9px] uppercase font-bold text-indigo-200 block tracking-wider leading-none mb-0.5">
                  Lvl
                </span>
                <span className="text-xl font-black leading-none block">
                  {level.current}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{level.title}</span>
            {/* XP bar */}
            <div className="w-full max-w-[100px]">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-0.5">
                <span>{level.xp} XP</span>
                <span>{level.xpToNext} XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
              <Flame size={26} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-lg font-black text-slate-800 leading-none">
              {streak.current}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              Day Streak
            </span>
            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
              <Trophy size={10} /> Best: {streak.best}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
