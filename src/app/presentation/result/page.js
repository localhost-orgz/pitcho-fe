"use client";

// src/app/presentation/result/page.js

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  Eye,
  AudioLines,
  Timer,
  Smile,
  PauseCircle,
  MessageSquare,
  Play,
  ChevronRight,
  CheckCircle,
  XCircle,
  Zap,
  ChevronLeft,
} from "lucide-react";

// ── Static demo data ────────────────────────────────────────
const METRICS = [
  {
    id: "eye",
    icon: Eye,
    label: "Eye Contact",
    value: "78%",
    subValue: "Good",
    subColor: "text-green-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    barColor: "bg-blue-500",
    barPct: 78,
    range: "70 – 100%",
    avgPct: 50,
    avgValue: "50%",
    userPct: 78,
  },
  {
    id: "filler",
    icon: AudioLines,
    label: "Filler Words",
    value: "2.1/min",
    subValue: "Needs Work",
    subColor: "text-orange-500",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    barColor: "bg-orange-400",
    barPct: 42,
    range: "0 – 5/min",
    avgPct: 65,
    avgValue: "4.5/min",
    userPct: 42,
  },
  {
    id: "pace",
    icon: Timer,
    label: "Speaking Pace",
    value: "128 wpm",
    subValue: "Good",
    subColor: "text-green-500",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    barColor: "bg-green-500",
    barPct: 70,
    range: "100 – 150 wpm",
    avgPct: 64,
    avgValue: "117 wpm",
    userPct: 70,
  },
  {
    id: "confidence",
    icon: Smile,
    label: "Confidence",
    value: "76%",
    subValue: "Good",
    subColor: "text-green-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    barColor: "bg-purple-400",
    barPct: 76,
    range: "0 – 100%",
    avgPct: 58,
    avgValue: "58%",
    userPct: 76,
  },
  {
    id: "pause",
    icon: PauseCircle,
    label: "Pause Duration",
    value: "1.8 s",
    subValue: "Good",
    subColor: "text-green-500",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    barColor: "bg-teal-400",
    barPct: 60,
    range: "0 – 5s",
    avgPct: 52,
    avgValue: "2.6 s",
    userPct: 60,
  },
  {
    id: "clarity",
    icon: MessageSquare,
    label: "Clarity",
    value: "85%",
    subValue: "Very Good",
    subColor: "text-green-600",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    barColor: "bg-indigo-400",
    barPct: 85,
    range: "0 – 100%",
    avgPct: 65,
    avgValue: "65%",
    userPct: 85,
  },
];

const KEY_MOMENTS = [
  { time: "00:45", label: "Distraction: Someone coughed", icon: Zap, iconClass: "text-orange-500" },
  { time: "03:12", label: "Filler Words Spike", icon: AudioLines, iconClass: "text-orange-400" },
  { time: "05:38", label: "Eye Contact Drop", icon: Eye, iconClass: "text-blue-500" },
  { time: "08:47", label: "Distraction: Door opened", icon: Zap, iconClass: "text-orange-500" },
  { time: "11:23", label: "Confidence Dip", icon: Smile, iconClass: "text-purple-400" },
];

const WHAT_WENT_WELL = [
  "Maintained good eye contact through distractions",
  "Clear and structured delivery",
  "Strong conclusion",
];

const FOCUS_AREAS = [
  "Reduce filler words at the beginning",
  "Slow down your pace in the closing section",
  'Try to use fewer "um" and "like"',
];

const SUGGESTED_DRILLS = [
  { label: "Filler Words Control", duration: "5 min" },
  { label: "Pace Regulation", duration: "4 min" },
  { label: "Eye Contact Training", duration: "6 min" },
];

const AI_FEEDBACK = [
  {
    icon: CheckCircle,
    iconClass: "text-green-500",
    text: "Great job maintaining eye contact with your audience, especially in the first half of your presentation.",
  },
  {
    icon: AudioLines,
    iconClass: "text-orange-400",
    text: "You used filler words more often during the introduction. Try pausing instead to gather your thoughts.",
  },
  {
    icon: Timer,
    iconClass: "text-blue-400",
    text: "Your pace was a bit fast toward the end. Slow down slightly to improve clarity.",
  },
];

// ── Score ring SVG ──────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <circle cx={65} cy={65} r={r} fill="none" stroke="#e8edf5" strokeWidth={10} />
      <circle
        cx={65} cy={65} r={r} fill="none"
        stroke="url(#scoreGrad)" strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <text x={65} y={60} textAnchor="middle" fontSize={26} fontWeight={900} fill="#1e293b">{score}</text>
      <text x={65} y={76} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight={600}>/100</text>
    </svg>
  );
}

// ── Metric top bar card ─────────────────────────────────────
function MetricCard({ metric }) {
  const Icon = metric.icon;
  return (
    <div className="flex flex-col items-center gap-1.5 px-3 py-4 bg-white rounded-2xl border-bold text-center min-w-0">
      <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
        <Icon size={18} className={metric.iconColor} />
      </div>
      <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase leading-none">
        {metric.label}
      </span>
      <span className="text-xl font-black text-slate-800 leading-tight">{metric.value}</span>
      <span className={`text-xs font-bold ${metric.subColor}`}>{metric.subValue}</span>
    </div>
  );
}

// ── Performance breakdown row ───────────────────────────────
function BreakdownRow({ metric }) {
  const Icon = metric.icon;
  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${metric.iconBg} shrink-0`}>
        <Icon size={13} className={metric.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-700">{metric.label}</span>
          <span className="text-xs font-black text-slate-800 ml-2 shrink-0">{metric.value}</span>
        </div>
        <div className="text-[10px] text-slate-400 font-semibold mb-1.5">{metric.range}</div>
        {/* User bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${metric.barColor}`}
              style={{ width: `${metric.userPct}%`, transition: "width 1s ease" }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold w-8 text-right shrink-0">{metric.userPct}%</span>
        </div>
        {/* Average bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-300 rounded-full"
              style={{ width: `${metric.avgPct}%`, transition: "width 1s ease" }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold w-8 text-right shrink-0">{metric.avgValue}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function PresentationResultPage() {
  const [playbackProgress, setPlaybackProgress] = useState(36); // demo %

  return (
    <div className="w-full min-h-screen">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/presentation/setup"
            className="flex items-center gap-1.5 text-slate-500 hover:text-main text-sm font-bold mb-3 transition-colors w-fit"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Post-Session Analysis
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1 flex items-center gap-2">
            <span>Presentation Practice</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            <span>May 27, 2025</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            <span>10:24 AM</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            <span>12m 45s</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
            <Download size={15} />
            Download Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-main text-white font-black text-sm border-b-4 border-blue-700 hover:border-b-2 hover:translate-y-[2px] transition-all">
            <RotateCcw size={15} />
            Practice Again
          </button>
        </div>
      </div>

      {/* ── Row 1: Score + Metric cards ──────────────────────── */}
      <div className="flex gap-4 mb-4">

        {/* Overall score card */}
        <div className="bg-white rounded-2xl border-bold px-5 py-5 flex items-center gap-5 shrink-0 w-[300px]">
          <ScoreRing score={82} />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Overall Score</p>
            <p className="text-base font-black text-slate-800 leading-tight">
              Great job! 🎉
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You delivered a clear message and maintained good focus through most of your presentation.
            </p>
            <button className="flex items-center gap-1 text-xs font-black text-main mt-1 hover:underline">
              See feedback <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Metric top cards grid */}
        <div className="flex-1 grid grid-cols-6 gap-3">
          {METRICS.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>

      {/* ── Row 2: Performance breakdown + Session Playback + What Went Well ── */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* Performance breakdown */}
        <div className="col-span-3 bg-white rounded-2xl border-bold px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 text-sm">Performance Breakdown</h2>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> You
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Avg User
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {METRICS.map((m) => (
              <BreakdownRow key={m.id} metric={m} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-4 leading-relaxed">
            Comparison is based on average of users in the same category.
          </p>
        </div>

        {/* Session Playback */}
        <div className="col-span-6 bg-white rounded-2xl border-bold px-5 py-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 text-sm">Session Playback</h2>
            <button className="flex items-center gap-1 text-xs font-black text-main hover:underline">
              View Full Recording <ChevronRight size={12} />
            </button>
          </div>

          {/* Video player mockup */}
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-900 relative min-h-0 aspect-video">
            {/* Thumbnail gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-white/80">
                <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                  <Play size={22} className="text-white ml-1" />
                </div>
                <span className="text-xs font-bold">Click to play recording</span>
              </div>

              {/* Cue card overlay (right side) */}
              <div className="absolute right-4 top-4 bg-black/60 rounded-xl px-4 py-3 text-white max-w-[180px]">
                <p className="text-[11px] font-black mb-2 text-white/80 uppercase tracking-wider">The Future of Work</p>
                <ul className="flex flex-col gap-1">
                  {["Automation and AI transformation", "Remote work and digital collaboration", "Skills of the future", "Adapting to change"].map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/70 font-medium">
                      <span className="w-1 h-1 rounded-full bg-white/50 mt-1 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-4 pb-3 pt-6">
              <div className="flex items-center gap-3 text-white mb-2">
                <Play size={14} className="cursor-pointer hover:text-white/70" />
                <span className="text-[10px] font-mono font-bold">05:36 / 12:45</span>
                <div className="flex-1" />
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-main rounded-full relative"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>

              {/* Marker legend */}
              <div className="flex items-center gap-4 mt-2.5">
                <span className="flex items-center gap-1 text-[9px] font-bold text-blue-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Eye Contact Drop
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" /> Filler Words Spike
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-purple-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" /> Confidence Dip
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-yellow-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Distraction Moment
                </span>
              </div>
            </div>
          </div>

          {/* AI Feedback + Key Moments row */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* AI Feedback */}
            <div>
              <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5">
                <span className="text-sm">✨</span> AI Feedback
              </h3>
              <div className="flex flex-col gap-3">
                {AI_FEEDBACK.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <Icon size={14} className={`${item.iconClass} shrink-0 mt-0.5`} />
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>
              <button className="flex items-center gap-1 text-xs font-black text-main mt-3 hover:underline">
                View Detailed Feedback <ChevronRight size={11} />
              </button>
            </div>

            {/* Key Moments */}
            <div>
              <h3 className="text-xs font-black text-slate-700 mb-3">Key Moments</h3>
              <div className="flex flex-col gap-2.5">
                {KEY_MOMENTS.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-black text-slate-400 w-10 shrink-0">{m.time}</span>
                      <Icon size={12} className={`${m.iconClass} shrink-0`} />
                      <span className="text-xs text-slate-600 font-medium flex-1">{m.label}</span>
                      <button className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-main/10 transition-colors shrink-0">
                        <Play size={8} className="text-slate-400 ml-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* What Went Well + Focus Areas + Suggested Drills */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* What Went Well */}
          <div className="bg-white rounded-2xl border-bold px-5 py-5 flex-1">
            <h2 className="font-black text-green-600 text-sm mb-3">What Went Well</h2>
            <div className="flex flex-col gap-2.5">
              {WHAT_WENT_WELL.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 font-medium leading-snug">{item}</p>
                </div>
              ))}
            </div>

            <h2 className="font-black text-orange-500 text-sm mt-5 mb-3">Focus Areas</h2>
            <div className="flex flex-col gap-2.5">
              {FOCUS_AREAS.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle size={13} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 font-medium leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Drills */}
          <div className="bg-white rounded-2xl border-bold px-5 py-5">
            <h2 className="font-black text-main text-sm mb-3">Suggested Drills</h2>
            <div className="flex flex-col gap-2.5">
              {SUGGESTED_DRILLS.map((drill, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{drill.label}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{drill.duration}</p>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-main/10 flex items-center justify-center hover:bg-main/20 transition-colors">
                    <Play size={11} className="text-main ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-1 text-xs font-black text-main mt-4 hover:underline">
              View All Drills <ChevronRight size={11} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
