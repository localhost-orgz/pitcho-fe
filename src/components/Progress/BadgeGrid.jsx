"use client";

import React, { useState } from "react";
import { Lock, Plus, Minus, Mic, Eye, Flame, Calendar, AudioLines, Shield, Zap, BookOpen, Smile, Trophy } from "lucide-react";

const ICON_MAP = {
  Mic, Eye, Flame, Calendar, AudioLines, Shield, Zap, BookOpen, Smile, Trophy,
};

// Color sets for badges
const COLOR_SETS = {
  purple: "text-purple-500 bg-purple-50 border-purple-200",
  emerald: "text-emerald-500 bg-emerald-50 border-emerald-200",
  amber: "text-amber-500 bg-amber-50 border-amber-200",
  sky: "text-sky-500 bg-sky-50 border-sky-200",
  indigo: "text-indigo-500 bg-indigo-50 border-indigo-200",
  rose: "text-rose-500 bg-rose-50 border-rose-200",
  orange: "text-orange-500 bg-orange-50 border-orange-200",
  teal: "text-teal-500 bg-teal-50 border-teal-200",
  pink: "text-pink-500 bg-pink-50 border-pink-200",
  yellow: "text-yellow-500 bg-yellow-50 border-yellow-200",
};

function BadgeDetailModal({ badge, onClose }) {
  const Icon = ICON_MAP[badge.icon] || Trophy;
  const colors = COLOR_SETS[badge.color] || COLOR_SETS.purple;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border-bold p-6 max-w-sm w-full animate-fade-in shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {/* Badge icon */}
          <div
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-md ${
              badge.unlocked ? colors : "bg-slate-100 border-slate-200"
            }`}
          >
            <Icon
              size={36}
              className={badge.unlocked ? "" : "text-slate-300"}
            />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-black text-slate-800">
              {badge.label}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {badge.desc}
            </p>
          </div>

          {/* Status */}
          {badge.unlocked ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
              <span className="text-xs font-extrabold">
                🎉 Earned {badge.unlockedDate}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                <Lock size={10} />
                <span className="text-xs font-extrabold">Locked</span>
              </div>

              {/* Progress bar */}
              {badge.progress && (
                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {badge.progress.current} / {badge.progress.target}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-main rounded-full transition-all duration-500"
                      style={{
                        width: `${(badge.progress.current / badge.progress.target) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Criteria */}
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            <span className="font-bold text-slate-500">Criteria: </span>
            {badge.criteria}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BadgeGrid({ badges }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Sort: unlocked first, then by progress descending
  const sorted = [...badges].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if (!a.unlocked && !b.unlocked) {
      const aPct = a.progress ? a.progress.current / a.progress.target : 0;
      const bPct = b.progress ? b.progress.current / b.progress.target : 0;
      return bPct - aPct;
    }
    return 0;
  });

  const visible = showAll ? sorted : sorted.slice(0, 5);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <>
      <div className="bg-white rounded-2xl border-bold px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Achievements
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              {unlockedCount} / {badges.length} Badges Earned
            </p>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-main text-xs font-black hover:underline cursor-pointer border-0 bg-transparent outline-none"
          >
            <span>{showAll ? "Collapse" : "View All"}</span>
            {showAll ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {visible.map((badge) => {
            const Icon = ICON_MAP[badge.icon] || Trophy;
            const colors = COLOR_SETS[badge.color] || COLOR_SETS.purple;

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center text-center p-3.5 border-2 rounded-2xl transition-all cursor-pointer hover:shadow-sm ${
                  badge.unlocked
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Badge icon */}
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative shadow-xs mb-2.5 ${
                    badge.unlocked ? colors : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <Icon
                    size={20}
                    className={badge.unlocked ? "" : "text-slate-300"}
                  />
                  {!badge.unlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-white border border-slate-200 p-0.5 rounded-full shadow-xs">
                      <Lock size={8} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-[11px] font-extrabold leading-tight ${
                    badge.unlocked ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {badge.label}
                </span>

                {/* Progress bar for locked badges */}
                {!badge.unlocked && badge.progress && (
                  <div className="w-full mt-2">
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-main/40 rounded-full"
                        style={{
                          width: `${(badge.progress.current / badge.progress.target) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                      {badge.progress.current}/{badge.progress.target}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}
