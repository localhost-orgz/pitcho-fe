"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import MiniLineChart from "@/components/UI/MiniLineChart";

const SKILL_CONFIG = {
  focus: {
    label: "Eye Contact",
    icon: "Eye",
    color: "#3b82f6",
    bgClass: "bg-blue-50 border-blue-200",
    textClass: "text-blue-600",
  },
  pace: {
    label: "Speaking Pace",
    icon: "Timer",
    color: "#10b981",
    bgClass: "bg-emerald-50 border-emerald-200",
    textClass: "text-emerald-600",
  },
  filler: {
    label: "Filler Control",
    icon: "Mic",
    color: "#f59e0b",
    bgClass: "bg-amber-50 border-amber-200",
    textClass: "text-amber-600",
  },
  efficiency: {
    label: "Clarity",
    icon: "Sparkles",
    color: "#8b5cf6",
    bgClass: "bg-indigo-50 border-indigo-200",
    textClass: "text-indigo-600",
  },
};

export default function SkillGrowthCard({ skillKey, data, isActive, onClick }) {
  const config = SKILL_CONFIG[skillKey];
  const { current, starting, trend, improvement } = data;
  const isPositive = improvement >= 0;
  const TrendIcon = improvement > 3 ? TrendingUp : improvement < -3 ? TrendingDown : Minus;
  const trendColor = improvement > 3 ? "text-emerald-500" : improvement < -3 ? "text-red-500" : "text-slate-400";

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 flex flex-col gap-3 transition-all cursor-pointer text-left bg-white ${
        isActive
          ? "border-main bg-main/5 shadow-md ring-1 ring-main/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Header: icon + label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: config.color + "18" }}
          >
            <span
              className="text-sm font-black"
              style={{ color: config.color }}
            >
              {config.label.charAt(0)}
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-700">
            {config.label}
          </span>
        </div>
        {isActive && (
          <div className="size-1.5 rounded-full bg-main animate-pulse" />
        )}
      </div>

      {/* Score + delta */}
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-slate-800 leading-none">
          {current}
          <span className="text-sm font-bold text-slate-400 ml-0.5">%</span>
        </span>
        <div className={`flex items-center gap-0.5 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-xs font-extrabold">
            {isPositive ? "+" : ""}{improvement}%
          </span>
        </div>
      </div>

      {/* Starting vs current comparison */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${current}%`,
              backgroundColor: config.color,
            }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
          from {starting}%
        </span>
      </div>

      {/* Sparkline */}
      <div className="w-full h-8">
        <MiniLineChart
          data={trend}
          color={config.color}
          strokeWidth={2}
        />
      </div>

      {/* "Details" link */}
      <span className="text-[10px] font-bold text-main hover:underline self-end">
        Details →
      </span>
    </button>
  );
}

export { SKILL_CONFIG };
