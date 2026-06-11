"use client";

import React from "react";
import { Lightbulb, TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles } from "lucide-react";
import { SKILL_CONFIG } from "./SkillGrowthCard";

export default function FocusArea({ skills, focusArea }) {
  const { weakestSkill, tips } = focusArea;

  // Find the weakest skill data
  const weakestData = skills[weakestSkill];
  const config = SKILL_CONFIG[weakestSkill];

  if (!weakestData || !config) {
    // All balanced / strong
    const allStrong = Object.entries(skills).every(([, data]) => data.current >= 80);
    if (allStrong) {
      return (
        <div className="bg-white rounded-2xl border-bold px-5 py-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Sparkles size={16} className="text-emerald-500" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">You&apos;re Crushing It!</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            All your skills are looking strong (80%+). Try a challenge to push yourself further or maintain your momentum with daily practice.
          </p>
          <a
            href="/challenges"
            className="flex items-center gap-1.5 text-xs font-extrabold text-main hover:underline self-start mt-1"
          >
            <span>Explore Challenges</span>
            <ArrowRight size={12} />
          </a>
        </div>
      );
    }
    return null;
  }

  const isPositive = weakestData.improvement >= 0;
  const TrendIcon = weakestData.improvement > 3 ? TrendingUp : weakestData.improvement < -3 ? TrendingDown : Minus;
  const trendColor = weakestData.improvement > 3 ? "text-emerald-500" : weakestData.improvement < -3 ? "text-red-500" : "text-slate-400";

  return (
    <div className="bg-white rounded-2xl border-bold px-5 py-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <Lightbulb size={16} className="text-amber-500" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Your Focus Area
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">
            Personalized improvement tips
          </span>
        </div>
      </div>

      {/* Weakest skill indicator */}
      <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-amber-100 bg-amber-50/50">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: config.color + "18" }}
        >
          <span className="text-lg font-black" style={{ color: config.color }}>
            {config.label.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-slate-700">
            {config.label}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-800">
              {weakestData.current}%
            </span>
            <div className={`flex items-center gap-0.5 ${trendColor}`}>
              <TrendIcon size={12} />
              <span className="text-[10px] font-extrabold">
                {isPositive ? "+" : ""}{weakestData.improvement}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-2.5">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-[10px] font-black text-main bg-main/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {tip}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href="/presentation/setup"
        className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-white bg-main hover:bg-main/90 px-4 py-2.5 rounded-xl transition-colors mt-1 shadow-sm"
      >
        <span>Practice {config.label}</span>
        <ArrowRight size={12} />
      </a>
    </div>
  );
}
