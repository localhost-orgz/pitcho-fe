"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  TrendingUp,
  Mic,
  Trophy,
  Info,
  Calendar,
  ChevronDown,
  Lock,
  Eye,
  Timer,
  AudioLines,
  Award,
  Plus,
  Minus
} from "lucide-react";
import ConsistencyHeatmap from "@/components/UI/ConsistencyHeatmap";

// ── Dummy Data for Months ────────────────────────────────────
const MONTHS_DATA = [
  {
    name: "May 2025",
    monthIndex: 4,
    year: 2025,
    streak: 15,
    bestStreak: 21,
    sessionsCompleted: 24,
    improvement: 18,
    badgesEarned: 7,
    radarUser: { eyeContact: 78, speakingPace: 72, fillerWords: 85 },
    radarAvg: { eyeContact: 60, speakingPace: 65, fillerWords: 68 },
    timeline: {
      eyeContact: [62, 65, 71, 75, 78],
      fillerWords: [55, 60, 68, 72, 85], // control percentage (higher is fewer filler words)
      wpm: [142, 138, 133, 130, 128] // approaching target wpm
    },
    sessions: {
      1: 1, 2: 0, 3: 2, 4: 0, 5: 1, 6: 1, 7: 0,
      8: 3, 9: 1, 10: 2, 11: 0, 12: 1, 13: 0, 14: 2,
      15: 3, 16: 2, 17: 1, 18: 3, 19: 2, 20: 0, 21: 1,
      22: 0, 23: 1, 24: 0, 25: 2, 26: 0, 27: 1, 28: 3,
      29: 2, 30: 0, 31: 1
    }
  },
  {
    name: "April 2025",
    monthIndex: 3,
    year: 2025,
    streak: 10,
    bestStreak: 18,
    sessionsCompleted: 18,
    improvement: 12,
    badgesEarned: 5,
    radarUser: { eyeContact: 70, speakingPace: 68, fillerWords: 75 },
    radarAvg: { eyeContact: 58, speakingPace: 63, fillerWords: 66 },
    timeline: {
      eyeContact: [55, 58, 62, 68, 70],
      fillerWords: [50, 52, 60, 65, 75],
      wpm: [150, 145, 140, 138, 135]
    },
    sessions: {
      1: 0, 2: 1, 3: 0, 4: 2, 5: 0, 6: 1, 7: 1,
      8: 0, 9: 2, 10: 0, 11: 3, 12: 1, 13: 0, 14: 1,
      15: 0, 16: 2, 17: 0, 18: 1, 19: 2, 20: 0, 21: 0,
      22: 3, 23: 1, 24: 0, 25: 1, 26: 0, 27: 2, 28: 0,
      29: 1, 30: 2
    }
  },
  {
    name: "March 2025",
    monthIndex: 2,
    year: 2025,
    streak: 6,
    bestStreak: 12,
    sessionsCompleted: 14,
    improvement: 8,
    badgesEarned: 4,
    radarUser: { eyeContact: 64, speakingPace: 60, fillerWords: 68 },
    radarAvg: { eyeContact: 57, speakingPace: 62, fillerWords: 65 },
    timeline: {
      eyeContact: [50, 52, 55, 60, 64],
      fillerWords: [42, 48, 55, 60, 68],
      wpm: [160, 155, 150, 146, 142]
    },
    sessions: {
      1: 1, 2: 0, 3: 0, 4: 1, 5: 0, 6: 2, 7: 0,
      8: 1, 9: 0, 10: 0, 11: 2, 12: 0, 13: 1, 14: 1,
      15: 0, 16: 0, 17: 2, 18: 0, 19: 1, 20: 0, 21: 3,
      22: 0, 23: 0, 24: 1, 25: 0, 26: 2, 27: 0, 28: 1,
      29: 0, 30: 1, 31: 0
    }
  }
];

// ── Badges List ──────────────────────────────────────────────
const BADGES = [
  { id: "smooth", label: "Smooth Speaker", desc: "Speak with minimal filler words", icon: Mic, color: "text-purple-500 bg-purple-50 border-purple-200", unlocked: true },
  { id: "eye", label: "Eye Contact Pro", desc: "Maintain 80%+ eye contact", icon: Eye, color: "text-emerald-500 bg-emerald-50 border-emerald-200", unlocked: true },
  { id: "focus", label: "Focus Keeper", desc: "Complete drills under distraction", icon: Flame, color: "text-amber-500 bg-amber-50 border-amber-200", unlocked: true },
  { id: "learner", label: "Consistent Learner", desc: "Practice 5 days in a row", icon: Calendar, color: "text-sky-500 bg-sky-50 border-sky-200", unlocked: true },
  { id: "clear", label: "Clear Communicator", desc: "Deliver optimal speaking pace", icon: AudioLines, color: "text-indigo-500 bg-indigo-50 border-indigo-200", unlocked: true },
  { id: "survivor", label: "Distraction Survivor", desc: "Survive sirens and visual blinks", icon: AlertTrianglePlaceholder, color: "text-slate-400 bg-slate-50 border-slate-200", unlocked: false },
  { id: "master", label: "High Pressure Master", desc: "Speak perfectly with high noise level", icon: ShieldPlaceholder, color: "text-slate-400 bg-slate-50 border-slate-200", unlocked: false },
  { id: "story", label: "Storyteller", desc: "Use storytelling elements in practice", icon: BookOpenPlaceholder, color: "text-slate-400 bg-slate-50 border-slate-200", unlocked: false },
  { id: "confident", label: "Confident Speaker", desc: "Reach 90%+ confidence level", icon: SmilePlaceholder, color: "text-slate-400 bg-slate-50 border-slate-200", unlocked: false },
  { id: "ace", label: "Presentation Ace", desc: "Complete 50 total presentation sessions", icon: Trophy, color: "text-slate-400 bg-slate-50 border-slate-200", unlocked: false }
];

// Placeholder components for custom icons since we want to avoid extra packages
function AlertTrianglePlaceholder({ className }) {
  return <Award className={className} />;
}
function ShieldPlaceholder({ className }) {
  return <Award className={className} />;
}
function BookOpenPlaceholder({ className }) {
  return <Award className={className} />;
}
function SmilePlaceholder({ className }) {
  return <Award className={className} />;
}

export default function ProgressPage() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [activeMetric, setActiveMetric] = useState("eyeContact");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load bg color like other dashboard pages
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f3f7fd";
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const activeData = MONTHS_DATA[selectedMonthIndex];

  // ── Build full-year daily duration data for GitHub‑style heatmap ──
  // Static mock data only has session counts, so assume 10 min (600 s) each.
  const fullYearDailyData = useMemo(() => {
    const map = {};
    MONTHS_DATA.forEach((month) => {
      Object.entries(month.sessions).forEach(([dayNum, count]) => {
        const dateStr = `${month.year}-${String(month.monthIndex + 1).padStart(2, "0")}-${String(Number(dayNum)).padStart(2, "0")}`;
        map[dateStr] = count * 600;
      });
    });
    return map;
  }, []);

  // ── Coordinates Helper for Triangle Radar Chart ────────────────
  // The center is (150, 160)
  // Axis 0 (Eye Contact): Up (-90 deg)
  // Axis 1 (Speaking Pace): Down-Right (30 deg)
  // Axis 2 (Filler Words): Down-Left (150 deg)
  const getRadarPoint = (value, axisIndex, maxVal = 100, radius = 110) => {
    const cx = 150;
    const cy = 135;
    const angleDegrees = axisIndex === 0 ? -90 : axisIndex === 1 ? 30 : 150;
    const angleRad = (angleDegrees * Math.PI) / 180;
    const distance = (value / maxVal) * radius;
    const x = cx + distance * Math.cos(angleRad);
    const y = cy + distance * Math.sin(angleRad);
    return { x, y };
  };

  const userPoint0 = getRadarPoint(activeData.radarUser.eyeContact, 0);
  const userPoint1 = getRadarPoint(activeData.radarUser.speakingPace, 1);
  const userPoint2 = getRadarPoint(activeData.radarUser.fillerWords, 2);

  const avgPoint0 = getRadarPoint(activeData.radarAvg.eyeContact, 0);
  const avgPoint1 = getRadarPoint(activeData.radarAvg.speakingPace, 1);
  const avgPoint2 = getRadarPoint(activeData.radarAvg.fillerWords, 2);

  // Background Grid Triangles
  const gridTriangles = [25, 50, 75, 100].map((v) => {
    const p0 = getRadarPoint(v, 0);
    const p1 = getRadarPoint(v, 1);
    const p2 = getRadarPoint(v, 2);
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`;
  });

  // ── Line Chart Math ──────────────────────────────────────────
  const lineChartWidth = 500;
  const lineChartHeight = 220;
  const linePoints = activeData.timeline[activeMetric];
  
  // Calculate coordinates for line points
  const points = linePoints.map((val, idx) => {
    const x = (idx / (linePoints.length - 1)) * (lineChartWidth - 60) + 30;
    
    // For WPM, we scale between 110 and 170. For percentages, between 40 and 100.
    const minVal = activeMetric === "wpm" ? 110 : 40;
    const maxVal = activeMetric === "wpm" ? 170 : 100;
    const range = maxVal - minVal;
    
    // Draw WPM downwards if WPM is higher? No, standard line chart is higher value = higher coordinate (less y offset)
    const y = lineChartHeight - ((val - minVal) / range) * (lineChartHeight - 60) - 30;
    return { x, y, val };
  });

  const linePath = points.reduce((acc, pt, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
  }, "");

  const areaPath = linePath + ` L ${points[points.length - 1].x} ${lineChartHeight - 30} L ${points[0].x} ${lineChartHeight - 30} Z`;

  // Get labels for line chart X-axis based on selected month
  const getXAxisLabels = () => {
    if (activeData.name.includes("May")) {
      return ["May 1", "May 8", "May 15", "May 22", "May 29"];
    } else if (activeData.name.includes("April")) {
      return ["Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 29"];
    } else {
      return ["Mar 1", "Mar 8", "Mar 15", "Mar 22", "Mar 29"];
    }
  };

  const xLabels = getXAxisLabels();

  // Streak Circular Progress calculation
  const streakRadius = 45;
  const streakCircumference = 2 * Math.PI * streakRadius;
  const streakPercent = Math.min((activeData.streak / activeData.bestStreak) * 100, 100);
  const streakOffset = streakCircumference - (streakPercent / 100) * streakCircumference;

  return (
    <div className="w-full min-h-screen pb-12">
      {/* ─── Header Row ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Your Progress
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track your speaking journey and see how you're improving over time.
          </p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white border-bold px-4 py-2.5 hover:bg-slate-50 active:translate-y-[2px] transition-all duration-100 cursor-pointer font-extrabold text-slate-700 text-sm"
          >
            <Calendar size={16} className="text-slate-400" />
            <span>{activeData.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border-bold shadow-lg z-20 overflow-hidden">
              {MONTHS_DATA.map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMonthIndex(idx);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-slate-100 last:border-0 transition-colors ${
                    selectedMonthIndex === idx
                      ? "bg-sky-50 text-main"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {month.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Profile & Statistics Banner ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Level card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100/50 rounded-2xl border-bold border-indigo-200 px-5 py-6 flex items-center gap-5 relative overflow-hidden group">
          {/* Decorative shapes */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
          
          {/* Level Hexagon Badge */}
          <div className="relative shrink-0 flex items-center justify-center w-16 h-18 bg-indigo-600 text-white font-extrabold rounded-lg shadow-md before:content-[''] before:absolute before:inset-0 before:bg-indigo-500 before:rotate-45 before:rounded-lg before:-z-10 after:content-[''] after:absolute after:inset-0 after:bg-indigo-700 after:-rotate-45 after:rounded-lg after:-z-20">
            <div className="text-center z-10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block tracking-wider leading-none mb-0.5">Lvl</span>
              <span className="text-2xl font-black leading-none block">12</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-slate-800">
                Focused Communicator
              </h2>
              <Info size={14} className="text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You're in the <span className="text-indigo-600 font-black">top 18%</span> of all speakers! Keep up the momentum.
            </p>
          </div>
        </div>

        {/* Stats widgets */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Day Streak */}
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-orange-500 fill-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-slate-800 leading-none">
                {activeData.streak}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Day Streak
              </span>
            </div>
          </div>

          {/* Improvement */}
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-emerald-600 leading-none">
                +{activeData.improvement}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Improvement
              </span>
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              <Mic size={20} className="text-sky-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-slate-800 leading-none">
                {activeData.sessionsCompleted}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Sessions
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl border-bold px-4 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Trophy size={20} className="text-amber-500 fill-amber-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-slate-800 leading-none">
                {activeData.badgesEarned}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                Badges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Radar Chart + Line Chart ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Speaking Skills Radar Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border-bold px-5 py-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              Speaking Skills Overview
              <Info size={14} className="text-slate-400 cursor-help" />
            </h3>
          </div>

          {/* Custom SVG Radar Chart */}
          <div className="relative w-[300px] h-[260px] flex items-center justify-center">
            <svg width={300} height={260} className="overflow-visible">
              {/* Concentric grid lines */}
              {gridTriangles.map((dPath, i) => (
                <path
                  key={i}
                  d={dPath}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
              ))}

              {/* Axis lines */}
              {[0, 1, 2].map((idx) => {
                const end = getRadarPoint(100, idx);
                return (
                  <line
                    key={idx}
                    x1={150}
                    y1={135}
                    x2={end.x}
                    y2={end.y}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                );
              })}

              {/* "Average User" Polygon */}
              <path
                d={`M ${avgPoint0.x} ${avgPoint0.y} L ${avgPoint1.x} ${avgPoint1.y} L ${avgPoint2.x} ${avgPoint2.y} Z`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />

              {/* "You" Polygon */}
              <path
                d={`M ${userPoint0.x} ${userPoint0.y} L ${userPoint1.x} ${userPoint1.y} L ${userPoint2.x} ${userPoint2.y} Z`}
                fill="rgba(3, 136, 255, 0.12)"
                stroke="#0388ff"
                strokeWidth={2.5}
              />

              {/* Data points for User */}
              <circle cx={userPoint0.x} cy={userPoint0.y} r={4} fill="#0388ff" stroke="white" strokeWidth={1} />
              <circle cx={userPoint1.x} cy={userPoint1.y} r={4} fill="#0388ff" stroke="white" strokeWidth={1} />
              <circle cx={userPoint2.x} cy={userPoint2.y} r={4} fill="#0388ff" stroke="white" strokeWidth={1} />

              {/* Labels on Tips */}
              {/* 1. Eye Contact (Top) */}
              <text
                x={150}
                y={10}
                textAnchor="middle"
                fontSize={11}
                fontWeight={800}
                fill="#475569"
              >
                Eye Contact ({activeData.radarUser.eyeContact}%)
              </text>
              {/* 2. Speaking Pace (Bottom Right) */}
              <text
                x={getRadarPoint(100, 1).x + 8}
                y={getRadarPoint(100, 1).y + 12}
                textAnchor="start"
                fontSize={11}
                fontWeight={800}
                fill="#475569"
              >
                Speaking Pace ({activeData.radarUser.speakingPace}%)
              </text>
              {/* 3. Filler Words (Bottom Left) */}
              <text
                x={getRadarPoint(100, 2).x - 8}
                y={getRadarPoint(100, 2).y + 12}
                textAnchor="end"
                fontSize={11}
                fontWeight={800}
                fill="#475569"
              >
                Filler Words ({activeData.radarUser.fillerWords}%)
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-main inline-block" /> You
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-300 inline-block" /> Average User
            </span>
          </div>
        </div>

        {/* Improvement Timeline Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-bold px-5 py-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              Improvement Timeline
              <Info size={14} className="text-slate-400 cursor-help" />
            </h3>
            
            {/* Chart toggle buttons */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
              <button
                onClick={() => setActiveMetric("eyeContact")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                  activeMetric === "eyeContact"
                    ? "bg-white text-main shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Eye Contact
              </button>
              <button
                onClick={() => setActiveMetric("fillerWords")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                  activeMetric === "fillerWords"
                    ? "bg-white text-main shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Filler Words
              </button>
              <button
                onClick={() => setActiveMetric("wpm")}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                  activeMetric === "wpm"
                    ? "bg-white text-main shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                WPM
              </button>
            </div>
          </div>

          {/* Dynamic SVG Line Chart */}
          <div className="flex-1 w-full h-[220px] relative select-none">
            <svg width="100%" height={220} viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0388ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0388ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((gridIdx) => {
                const y = 30 + gridIdx * 40;
                return (
                  <line
                    key={gridIdx}
                    x1={30}
                    y1={y}
                    x2={lineChartWidth - 30}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Gradient Area Fill */}
              <path d={areaPath} fill="url(#lineGrad)" />

              {/* Line Path */}
              <path
                d={linePath}
                fill="none"
                stroke="#0388ff"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g key={idx} className="group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={6}
                    fill="#0388ff"
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer hover:r-7 transition-all"
                  />
                  {/* Floating Score Tag above point */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={900}
                    fill="#0388ff"
                  >
                    {pt.val}{activeMetric !== "wpm" && "%"}
                  </text>
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y={lineChartHeight - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={800}
                  fill="#94a3b8"
                >
                  {xLabels[idx]}
                </text>
              ))}
            </svg>
          </div>

          {/* Subtitle */}
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp size={15} />
            <span>16% improvement over the last 4 weeks</span>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Consistency Heatmap + Streak Circle ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Consistency contribution heatmap */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-bold px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Consistency
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Keep it up! Consistency is the key to improvement.
              </p>
            </div>

            {/* Legend — GitHub green palette */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ebedf0]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#9be9a8]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#40c463]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#30a14e]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#216e39]" />
              <span>More</span>
            </div>
          </div>

          {/* Reusable Heatmap Grid */}
          <div className="w-full mt-4">
            <ConsistencyHeatmap
              year={activeData.year}
              dailyData={fullYearDailyData}
            />
          </div>
        </div>

        {/* Streak widget */}
        <div className="lg:col-span-4 bg-white rounded-2xl border-bold px-5 py-5 flex flex-col items-center justify-center text-center">
          <h3 className="font-extrabold text-slate-800 text-sm mb-4 self-start">
            Streak
          </h3>

          <div className="relative w-28 h-28 flex items-center justify-center select-none mb-3">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle
                cx={55}
                cy={55}
                r={streakRadius}
                className="stroke-slate-100 fill-none dark:stroke-slate-850"
                strokeWidth={8}
              />
              <circle
                cx={55}
                cy={55}
                r={streakRadius}
                className="fill-none transition-all duration-500 ease-out"
                strokeWidth={8}
                stroke="url(#streakGrad)"
                strokeDasharray={streakCircumference}
                strokeDashoffset={streakOffset}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="flex flex-col items-center z-10">
              <Flame size={28} className="text-orange-500 fill-orange-500 animate-bounce duration-1000" />
              <span className="text-2xl font-black text-slate-800 leading-none mt-1">
                {activeData.streak}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase mt-0.5">
                Day Streak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
            <Trophy size={14} className="fill-amber-50" />
            <span>Best Streak: {activeData.bestStreak} days</span>
          </div>
        </div>
      </div>

      {/* ─── Row 4: Badges Collection ─── */}
      <div className="bg-white rounded-2xl border-bold px-5 py-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Badges Collection
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              {activeData.badgesEarned} / 28 Badges Earned
            </p>
          </div>
          <button
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="flex items-center gap-1 text-main text-xs font-black hover:underline cursor-pointer border-0 bg-transparent outline-none"
          >
            <span>{showAllBadges ? "Collapse View" : "View All"}</span>
            {showAllBadges ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {BADGES.slice(0, showAllBadges ? BADGES.length : 5).map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center p-4 border-2 rounded-2xl transition-all select-none hover:shadow-xs ${
                  badge.unlocked
                    ? "bg-white border-slate-200 text-slate-700"
                    : "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60"
                }`}
              >
                {/* Badge Icon Outer Frame */}
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center relative shadow-xs mb-3 ${
                    badge.unlocked ? badge.color : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <Icon size={24} className={badge.unlocked ? "" : "text-slate-300"} />
                  {!badge.unlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-white border border-slate-200 p-1 rounded-full shadow-xs">
                      <Lock size={10} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <span className={`text-xs font-extrabold leading-tight ${badge.unlocked ? "text-slate-800" : "text-slate-400"}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight mt-1 line-clamp-2">
                  {badge.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
