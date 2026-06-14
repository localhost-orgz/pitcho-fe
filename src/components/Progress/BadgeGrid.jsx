"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Search, Lock, Sparkles, X } from "lucide-react";
import BadgeIcon from "./BadgeIcon";
import { BADGE_COLORS, CATEGORY_META } from "@/lib/badgeDefinitions";

// ── Category filter chip ──────────────────────────────────────
function CategoryChip({ category, isActive, onClick, count }) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  const colors = BADGE_COLORS[meta.color] || BADGE_COLORS.green;

  return (
    <button
      onClick={() => onClick(category)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer border-2 ${
        isActive
          ? "bg-white border-slate-300 text-slate-800 shadow-sm"
          : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600 hover:bg-white hover:border-slate-200"
      }`}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.top }}
      />
      {meta.label}
      <span className="text-slate-300">{count}</span>
    </button>
  );
}

// ── Badge Detail Modal ────────────────────────────────────────
function BadgeDetailModal({ badge, onClose }) {
  const colors = BADGE_COLORS[badge.color] || BADGE_COLORS.green;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — fixed to always cover full viewport */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[24px] p-6 max-w-sm w-full animate-fade-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-4 mt-2">
          {/* Badge card (md size) */}
          <div className="flex justify-center">
            <BadgeIcon
              badge={badge}
              size="md"
              unlocked={badge.unlocked}
            />
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[260px]">
            {badge.description}
          </p>

          {/* Category tag */}
          {CATEGORY_META[badge.category] && (
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                color: colors.bottom,
                backgroundColor: `${colors.top}15`,
              }}
            >
              {CATEGORY_META[badge.category].label}
            </span>
          )}

          {/* Status badge */}
          {badge.unlocked ? (
            <div
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
              style={{
                backgroundColor: `${colors.top}12`,
                color: colors.bottom,
              }}
            >
              <Sparkles size={12} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-extrabold">
                Earned {badge.unlockedDate || ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
              <Lock size={10} />
              <span className="text-xs font-extrabold">Locked</span>
            </div>
          )}

          {/* Criteria */}
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed border-t border-slate-100 pt-3 w-full">
            <span className="font-bold text-slate-500">How to earn: </span>
            {badge.criteria || badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────
const GRID_COLS = {
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
};

function BadgeGridSkeleton({ maxCols = 4 }) {
  const cols = GRID_COLS[maxCols] || GRID_COLS[4];
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-36 bg-slate-100 rounded" />
        </div>
      </div>
      <div className={`grid gap-4 ${cols}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[20px] bg-white p-4 flex flex-col items-center gap-3"
            style={{
              boxShadow:
                "0 4px 16px rgba(160,192,96,0.1), 0 1px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div className="w-[72px] h-[72px] bg-slate-200" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-2.5 w-10 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function BadgeGridEmpty() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Achievements
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            0 / 0 Badges Earned
          </p>
        </div>
      </div>
      <div
        className="rounded-[20px] bg-white py-12 flex flex-col items-center gap-3"
        style={{
          boxShadow:
            "0 4px 16px rgba(160,192,96,0.1), 0 1px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div className="p-4 bg-slate-100 rounded-full">
          <Trophy size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-400 text-center max-w-[200px]">
          Complete your first session to start earning badges!
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

/**
 * Displays a grid of badge cards.
 *
 * @param {Array}  badges  - Badge display objects (from buildBadgeDisplayData)
 * @param {boolean} loading - Show skeleton state
 * @param {boolean} compact - Fewer columns, tighter layout
 * @param {number}  maxCols - Max columns on large screens (4, 5, or 6; default 4)
 */
export default function BadgeGrid({ badges = [], loading = false, compact = false, maxCols = 4 }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // ── Category counts ─────────────────────────────────────────
  const categories = useMemo(() => {
    const catMap = {};
    badges.forEach((b) => {
      if (!catMap[b.category]) {
        catMap[b.category] = { count: 0, unlocked: 0 };
      }
      catMap[b.category].count++;
      if (b.unlocked) catMap[b.category].unlocked++;
    });
    return catMap;
  }, [badges]);

  // ── Filter + sort ───────────────────────────────────────────
  const displayBadges = useMemo(() => {
    let list = activeCategory
      ? badges.filter((b) => b.category === activeCategory)
      : badges;

    // Sort: unlocked first, then by level descending
    return [...list].sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return b.level - a.level;
    });
  }, [badges, activeCategory]);

  const unlockedCount = displayBadges.filter((b) => b.unlocked).length;
  const totalCount = displayBadges.length;

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return <BadgeGridSkeleton maxCols={maxCols} />;

  // ── Empty ───────────────────────────────────────────────────
  if (badges.length === 0) return <BadgeGridEmpty />;

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Achievements
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {unlockedCount} / {totalCount} Badges Earned
          </p>
        </div>
      </div>

      {/* Category filter chips */}
      {!compact && Object.keys(categories).length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer border-2 ${
              activeCategory === null
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600 hover:bg-white hover:border-slate-200"
            }`}
          >
            <Search size={10} />
            All
            <span className="opacity-60">{badges.length}</span>
          </button>
          {Object.entries(categories).map(([catKey, catData]) => (
            <CategoryChip
              key={catKey}
              category={catKey}
              isActive={activeCategory === catKey}
              onClick={() =>
                setActiveCategory(activeCategory === catKey ? null : catKey)
              }
              count={catData.count}
            />
          ))}
        </div>
      )}

      {/* Badge card grid */}
      <div
        className={`grid gap-4 ${
          compact
            ? "grid-cols-2"
            : GRID_COLS[maxCols] || GRID_COLS[4]
        }`}
      >
        {displayBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className="border-0 bg-transparent p-0 cursor-pointer outline-none flex justify-center w-full"
          >
            <BadgeIcon
              badge={badge}
              size="sm"
              unlocked={badge.unlocked}
              showHover
            />
          </button>
        ))}
      </div>

      {/* Filtered-empty state */}
      {displayBadges.length === 0 && (
        <div
          className="rounded-[20px] bg-white py-10 flex flex-col items-center gap-2"
          style={{
            boxShadow:
              "0 4px 16px rgba(160,192,96,0.1), 0 1px 4px rgba(0,0,0,0.02)",
          }}
        >
          <p className="text-xs font-bold text-slate-400">
            No badges in this category yet.
          </p>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-xs font-extrabold text-main hover:underline cursor-pointer bg-transparent border-0"
          >
            Show all categories
          </button>
        </div>
      )}

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
