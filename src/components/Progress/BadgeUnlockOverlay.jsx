"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import BadgeIcon from "./BadgeIcon";
import { BADGE_COLORS, CATEGORY_META } from "@/lib/badgeDefinitions";

// ── Confetti particle generator ───────────────────────────────
const CONFETTI_COLORS = [
  "#4caf1e",
  "#f5a623",
  "#9b59f5",
  "#0388ff",
  "#fabf24",
  "#10b981",
  "#f43f5e",
  "#ec4899",
];

function generateParticles(count = 60) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 8 + 4;
    particles.push({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: Math.random() > 0.5 ? `${size}px` : `${size * 0.4}px`,
      height: `${size}px`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      delay: `${(Math.random() * 0.8).toFixed(2)}s`,
      duration: `${(Math.random() * 2 + 2.5).toFixed(2)}s`,
      sway: `${((Math.random() - 0.5) * 200).toFixed(0)}px`,
    });
  }
  return particles;
}

// ── Main component ────────────────────────────────────────────

/**
 * Full-screen celebration overlay shown when one or more badges unlock.
 *
 * @param {Array} badges   - Newly unlocked badge display objects
 * @param {Function} onDismiss - Called when overlay is dismissed
 */
export default function BadgeUnlockOverlay({ badges = [], onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles] = useState(() => generateParticles(60));
  const [exiting, setExiting] = useState(false);

  // Animate in after mount
  useEffect(() => {
    if (badges.length > 0) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [badges]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible || exiting) return;
    const timer = setTimeout(() => handleDismiss(), 6000);
    return () => clearTimeout(timer);
  }, [visible, exiting, currentIndex]);

  const handleDismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss?.(), 300);
  }, [exiting, onDismiss]);

  const handleNext = useCallback(() => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleDismiss();
    }
  }, [currentIndex, badges.length, handleDismiss]);

  if (badges.length === 0 && !exiting) return null;

  const badge = badges[currentIndex];
  if (!badge) return null;

  const colors = BADGE_COLORS[badge.color] || BADGE_COLORS.green;
  const category = CATEGORY_META[badge.category];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Badge unlocked: ${badge.name}`}
    >
      {/* Radial gradient backdrop — tinted to badge color */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.top}20 0%, ${colors.top}08 35%, rgba(15,23,42,0.88) 100%)`,
          backdropFilter: "blur(8px)",
        }}
        onClick={handleDismiss}
      />

      {/* CSS Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 animate-confetti-fall pointer-events-none"
            style={{
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: p.borderRadius,
              "--delay": p.delay,
              "--duration": p.duration,
              "--sway": p.sway,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`relative flex flex-col items-center gap-6 ${
          visible && !exiting ? "animate-badge-reveal" : "opacity-0"
        }`}
      >
        {/* "Badge Unlocked!" chip */}
        <div
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-sm text-white"
          style={{ borderColor: `${colors.top}40` }}
        >
          <Sparkles size={12} className="text-amber-400" fill="currentColor" />
          Badge Unlocked!
        </div>

        {/* Badge card (large) with glow */}
        <div
          className="animate-badge-glow"
          style={{ "--glow-color": `${colors.top}40` }}
        >
          <BadgeIcon
            badge={badge}
            size="lg"
            unlocked={true}
          />
        </div>

        {/* Category tag */}
        {category && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            {category.label}
          </span>
        )}

        {/* Multi-badge dot indicator */}
        {badges.length > 1 && (
          <div
            className="flex items-center gap-1.5"
            aria-label={`Badge ${currentIndex + 1} of ${badges.length}`}
          >
            {badges.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-white scale-125"
                    : i < currentIndex
                      ? "bg-white/50"
                      : "bg-white/25"
                }`}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/progress-v2"
            className="flex items-center justify-center gap-2 bg-white text-slate-800 font-extrabold text-sm px-6 py-3 rounded-xl shadow-[0_4px_0_#e2e8f0] active:translate-y-[4px] active:shadow-[0_0_0_#e2e8f0] transition-all cursor-pointer hover:bg-white/95"
            onClick={handleDismiss}
          >
            View Collection
            <ArrowRight size={14} />
          </Link>
          {currentIndex < badges.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-1 text-white font-extrabold text-xs px-4 py-3 rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer bg-transparent"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center gap-1 text-white font-extrabold text-xs px-4 py-3 rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer bg-transparent"
            >
              <X size={14} />
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
