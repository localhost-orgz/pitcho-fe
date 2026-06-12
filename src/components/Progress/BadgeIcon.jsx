"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { BADGE_COLORS } from "@/lib/badgeDefinitions";

// ── Hexagon geometry constants ─────────────────────────────────
// Point-up flat-top hexagon centered in a 100×100 viewBox.
// Formula: Pn = (cx + r·cos(θn), cy + r·sin(θn)) with θ at 90°, 30°, -30°, -90°, -150°, 150°
// Radius r=44 gives a hexagon ~88px wide × 88px tall, fitting inside viewBox with margin.

const CX = 50;
const CY = 50;
const R = 44;

// Precompute hexagon points
const HEX_POINTS = [
  { x: CX, y: CY - R },                    // 0: top point (90°)
  { x: CX + R * 0.866, y: CY - R * 0.5 },  // 1: top-right (30°)
  { x: CX + R * 0.866, y: CY + R * 0.5 },  // 2: bottom-right (-30°)
  { x: CX, y: CY + R },                    // 3: bottom point (-90°)
  { x: CX - R * 0.866, y: CY + R * 0.5 },  // 4: bottom-left (-150°)
  { x: CX - R * 0.866, y: CY - R * 0.5 },  // 5: top-left (150°)
];

const HEX_POINTS_STR = HEX_POINTS.map((p) => `${p.x},${p.y}`).join(" ");

// Offset for the 3D bottom layer (shifted down by 5 SVG units)
const SHADOW_OFFSET = 5;
const SHADOW_POINTS_STR = HEX_POINTS.map(
  (p) => `${p.x},${p.y + SHADOW_OFFSET}`
).join(" ");

// ── Size presets ───────────────────────────────────────────────
const SIZES = {
  sm: {
    card: "w-[150px]",
    padding: "p-4",
    hexViewBox: "0 0 100 100",
    hexClass: "w-[72px] h-[72px]",
    iconSize: 30,
    nameSize: "text-[13px]",
    levelSize: "text-[11px]",
    gap: "gap-3",
    radius: "rounded-[20px]",
  },
  md: {
    card: "w-[200px]",
    padding: "p-6",
    hexViewBox: "0 0 100 100",
    hexClass: "w-[96px] h-[96px]",
    iconSize: 40,
    nameSize: "text-[15px]",
    levelSize: "text-[12px]",
    gap: "gap-4",
    radius: "rounded-[22px]",
  },
  lg: {
    card: "w-[260px]",
    padding: "p-8",
    hexViewBox: "0 0 100 100",
    hexClass: "w-[130px] h-[130px]",
    iconSize: 54,
    nameSize: "text-[18px]",
    levelSize: "text-[13px]",
    gap: "gap-5",
    radius: "rounded-[24px]",
  },
};

// ── 3D Double-Hexagon SVG ──────────────────────────────────────

/**
 * Renders the two-layer hexagon with a white icon centered inside.
 */
function HexagonBadge({ colorKey, iconName, iconSize, hexClass, unlocked = true }) {
  const colors = BADGE_COLORS[colorKey] || BADGE_COLORS.gray;
  const LucideIcon = LucideIcons[iconName] || LucideIcons.Star;

  // Locked badges always use gray
  const topColor = unlocked ? colors.top : BADGE_COLORS.gray.top;
  const bottomColor = unlocked ? colors.bottom : BADGE_COLORS.gray.bottom;

  return (
    <div className={`relative ${hexClass}`}>
      <svg
        viewBox="0 0 100 110"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Bottom layer (shadow/depth) — shifted down */}
        <polygon
          points={SHADOW_POINTS_STR}
          fill={bottomColor}
          stroke="none"
        />

        {/* Top layer (main color) */}
        <polygon
          points={HEX_POINTS_STR}
          fill={topColor}
          stroke="none"
        />
      </svg>

      {/* White icon centered on the top hexagon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ marginTop: "-3px" /* optical centering — icon sits on the top hex, not the full stack */ }}>
        <LucideIcon
          size={iconSize}
          className="text-white drop-shadow-sm"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}

// ── Badge Card (full badge display) ────────────────────────────

/**
 * Renders a complete badge card: white card with shadow, 3D hexagon, and text labels.
 *
 * @param {Object} badge     - Badge definition object with { name, icon, color, level, unlocked? }
 * @param {"sm"|"md"|"lg"} size - sm=grid card, md=detail modal, lg=unlock overlay
 * @param {boolean} unlocked - Whether the badge is earned
 * @param {boolean} showHover - Enable hover lift effect (grid view)
 */
export default function BadgeIcon({
  badge,
  size = "md",
  unlocked = false,
  showHover = false,
}) {
  const sz = SIZES[size];

  // Force gray if locked
  const colorKey = unlocked ? badge.color : "gray";
  const levelLabel = unlocked ? `Level ${badge.level}` : "Locked";

  return (
    <div
      className={`
        ${sz.card} ${sz.padding} ${sz.radius} ${sz.gap}
        flex flex-col items-center
        bg-white border-bold
        transition-all duration-300
        ${showHover ? "hover:-translate-y-1 cursor-pointer" : ""}
      `}
    >
      {/* 3D Hexagon */}
      <HexagonBadge
        colorKey={colorKey}
        iconName={badge.icon}
        iconSize={sz.iconSize}
        hexClass={sz.hexClass}
        unlocked={unlocked}
      />

      {/* Text labels */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`${sz.nameSize} font-bold text-[#1a1a1a] leading-tight text-center line-clamp-2 max-w-full`}
        >
          {badge.name}
        </span>
        <span
          className={`${sz.levelSize} font-normal text-[#666666]`}
        >
          {levelLabel}
        </span>
      </div>
    </div>
  );
}
