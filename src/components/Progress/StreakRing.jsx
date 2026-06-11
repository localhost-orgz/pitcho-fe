"use client";

import React from "react";
import { Flame, Trophy } from "lucide-react";

export default function StreakRing({ current, best, practicedToday }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const percent = best > 0 ? Math.min((current / best) * 100, 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center h-full gap-3">
      <h3 className="font-extrabold text-slate-800 text-sm self-start">Streak</h3>

      {/* Circular progress */}
      <div className="relative w-24 h-24 flex items-center justify-center select-none">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx={50}
            cy={50}
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth={7}
          />
          <circle
            cx={50}
            cy={50}
            r={radius}
            className="fill-none transition-all duration-700 ease-out"
            strokeWidth={7}
            stroke="url(#streakGradient)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center z-10">
          <Flame
            size={24}
            className="text-orange-500 fill-orange-500"
            style={{ animation: current > 0 ? "bounce 1s infinite" : "none" }}
          />
          <span className="text-xl font-black text-slate-800 leading-none mt-0.5">
            {current}
          </span>
          <span className="text-[8px] text-slate-400 font-extrabold tracking-wide uppercase">
            Days
          </span>
        </div>
      </div>

      {/* Best streak */}
      <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
        <Trophy size={12} className="fill-amber-50" />
        <span>Best: {best} days</span>
      </div>

      {/* Practiced today indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={`size-2 rounded-full ${
            practicedToday ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
          }`}
        />
        <span className="text-[10px] font-bold text-slate-400">
          {practicedToday ? "Practiced today!" : "Not yet today"}
        </span>
      </div>

      {current >= 3 && (
        <button className="mt-1 text-[10px] font-extrabold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
          Protect your streak 🔥
        </button>
      )}
    </div>
  );
}
