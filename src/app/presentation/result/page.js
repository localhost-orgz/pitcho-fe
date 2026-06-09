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
  Play,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/UI/button";

// ── Static demo data ────────────────────────────────────────
const METRICS = [
  {
    id: "eye",
    icon: Eye,
    label: "Eye Contact",
    value: "20 times",
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
    value: "3 filler words",
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
];

const KEY_MOMENTS = [
  {
    time: "00:45",
    label: "Distraction: Someone coughed",
    icon: Zap,
    iconClass: "text-orange-500",
  },
  {
    time: "03:12",
    label: "Filler Words Spike",
    icon: AudioLines,
    iconClass: "text-orange-400",
  },
  {
    time: "05:38",
    label: "Eye Contact Drop",
    icon: Eye,
    iconClass: "text-blue-500",
  },
  {
    time: "08:47",
    label: "Distraction: Door opened",
    icon: Zap,
    iconClass: "text-orange-500",
  },
  {
    time: "11:23",
    label: "Confidence Dip",
    icon: Smile,
    iconClass: "text-purple-400",
  },
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

// ── Tab 2: Pace Segments & Tips ──────────────────────────────
const PACE_SEGMENTS = [
  {
    time: "00:00 - 02:30",
    wpm: 112,
    status: "Ideal Pace",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    time: "02:30 - 05:00",
    wpm: 128,
    status: "Ideal Pace",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    time: "05:00 - 07:30",
    wpm: 145,
    status: "Slightly Fast",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    time: "07:30 - 10:00",
    wpm: 117,
    status: "Ideal Pace",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    time: "10:00 - 12:45",
    wpm: 158,
    status: "Too Fast",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const PACE_TIPS = [
  {
    title: "Control speed during slide transitions",
    desc: "Take a deep breath and pause for 2 seconds before explaining a new slide to prevent accelerating your speech.",
  },
  {
    title: "Use structural pauses",
    desc: "After key statements or statistics, pause to let the message sink in and help lower your average speaking rate.",
  },
];

// ── Tab 3: Filler Words Distribution & Timestamps ────────────
const FILLER_BREAKDOWN = [
  { word: "uhm / eeee", count: 14, color: "bg-blue-500", pct: 40 },
  { word: "ahm / ohh", count: 9, color: "bg-orange-400", pct: 25 },
  { word: "like / basically", count: 12, color: "bg-purple-500", pct: 30 },
  { word: "others", count: 4, color: "bg-slate-400", pct: 5 },
];

const FILLER_EVENTS = [
  {
    time: "01:14",
    word: "eee",
    phrase: "...dan juga kita harus *eee* berkolaborasi dengan...",
  },
  {
    time: "03:22",
    word: "uhm",
    phrase: "...karena *uhm* teknologi ini akan sangat membantu...",
  },
  {
    time: "06:45",
    word: "like",
    phrase: "...ini seperti *like* sangat efisien untuk tim...",
  },
  {
    time: "08:12",
    word: "eee",
    phrase: "...jadi kita perlu *eee* merencanakan ulang...",
  },
];

// ── Tab 4: Wordiness & Pleonasm Correction ──────────────────
const WORDINESS_ITEMS = [
  {
    original: "pada saat sekarang ini",
    improved: "sekarang / saat ini",
    context: "...kemajuan yang kita capai *pada saat sekarang ini* sangat...",
    explanation:
      "Menggunakan 4 kata padahal bisa digantikan dengan 1-2 kata yang lebih langsung.",
  },
  {
    original: "dalam rangka untuk mencapai",
    improved: "untuk mencapai",
    context:
      "...perlu koordinasi yang baik *dalam rangka untuk mencapai* tujuan...",
    explanation:
      "'Dalam rangka untuk' adalah bentuk pleonasme, cukup gunakan 'untuk'.",
  },
  {
    original: "sangat-sangat penting sekali",
    improved: "sangat penting",
    context:
      "...hal ini menjadi *sangat-sangat penting sekali* bagi perkembangan...",
    explanation:
      "Pengulangan kata penegas ('sangat-sangat') ditambah 'sekali' berlebihan.",
  },
  {
    original: "melakukan koordinasi kembali",
    improved: "berkoordinasi kembali",
    context:
      "...tim desain harus *melakukan koordinasi kembali* dengan tim dev...",
    explanation:
      "Gunakan kata kerja aktif 'berkoordinasi' untuk menyederhanakan kalimat.",
  },
];

// ── Score ring SVG ──────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130" className="shrink-0">
      <circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke="#e8edf5"
        strokeWidth={10}
      />
      <circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
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
      <text
        x={65}
        y={60}
        textAnchor="middle"
        fontSize={26}
        fontWeight={900}
        fill="#1e293b"
      >
        {score}
      </text>
      <text
        x={65}
        y={76}
        textAnchor="middle"
        fontSize={11}
        fill="#94a3b8"
        fontWeight={600}
      >
        /100
      </text>
    </svg>
  );
}

// ── Metric top bar card ─────────────────────────────────────
function MetricCard({ metric }) {
  const Icon = metric.icon;
  return (
    <div className="flex flex-col items-center justify-evenly px-3 py-4 bg-white rounded-2xl border-bold text-center min-w-0 gap-1">
      <div className="flex flex-col items-center gap-2">
        <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
          <Icon size={18} className={metric.iconColor} />
        </div>
        <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase leading-none">
          {metric.label}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-black text-slate-800 leading-tight">
          {metric.value}
        </span>
        <span className={`text-xs font-bold ${metric.subColor}`}>
          {metric.subValue}
        </span>
      </div>
    </div>
  );
}

// ── Performance breakdown row ───────────────────────────────
function BreakdownRow({ metric }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
          Your Performance
        </span>
        <span className="text-xs font-black text-slate-800">
          {metric.value}
        </span>
      </div>

      {/* User bar */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${metric.barColor}`}
            style={{
              width: `${metric.userPct}%`,
              transition: "width 1s ease",
            }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-semibold w-8 text-right shrink-0">
          {metric.userPct}%
        </span>
      </div>

      {/* Average bar */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[10px] font-bold text-slate-400">
          Average Peer Performance
        </span>
        <span className="text-[10px] font-bold text-slate-500">
          {metric.avgValue}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-300 rounded-full"
            style={{
              width: `${metric.avgPct}%`,
              transition: "width 1s ease",
            }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-semibold w-8 text-right shrink-0">
          {metric.avgPct}%
        </span>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function PresentationResultPage() {
  const [playbackProgress, setPlaybackProgress] = useState(36); // demo %
  const [activeTab, setActiveTab] = useState("eye"); // 'eye' | 'tempo' | 'filler' | 'wordiness'

  return (
    <div className="w-full min-h-screen">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Post-Session Analysis</h1>
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
          <Button>
            <Download size={15} />
            Download Report
          </Button>
          <Button variant={"primary"}>
            <RotateCcw size={15} />
            Practice Again
          </Button>
        </div>
      </div>

      {/* ── Row 1: Score + Metric cards ──────────────────────── */}
      <div className="flex gap-4 mb-6">
        {/* Overall score card */}
        <div className="bg-white rounded-2xl border-bold px-5 py-5 flex items-center gap-5 shrink-0 w-lg">
          <ScoreRing score={82} />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Score
            </p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              Great job! 🎉
            </p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              You delivered a clear message and maintained good focus through
              most of your presentation.
            </p>
          </div>
        </div>

        {/* Metric top cards grid */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {METRICS.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex border-b-2 border-slate-200 gap-1 mb-6">
        <button
          onClick={() => setActiveTab("eye")}
          className={`pb-3 px-6 text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer ${
            activeTab === "eye"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Eye Tracking
        </button>
        <button
          onClick={() => setActiveTab("tempo")}
          className={`pb-3 px-6 text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer ${
            activeTab === "tempo"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Pace & Tempo
        </button>
        <button
          onClick={() => setActiveTab("filler")}
          className={`pb-3 px-6 text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer ${
            activeTab === "filler"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Filler Words
        </button>
        <button
          onClick={() => setActiveTab("wordiness")}
          className={`pb-3 px-6 text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer ${
            activeTab === "wordiness"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Wordiness (Pemborosan Kata)
        </button>
      </div>

      {/* ── Tab Contents ──────────────────────────────────────── */}
      {/* ── Tab 1: Eye Tracking ── */}
      {activeTab === "eye" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Performance Playback View */}
          <div className="col-span-8 bg-white rounded-2xl border-bold p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-sm">
                Focus & Eye Tracking Replay
              </h2>
              <span className="text-xs font-bold text-slate-400">
                Visualizing look-away moments
              </span>
            </div>

            {/* Video player mockup */}
            <div className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video">
              {/* Thumbnail gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-white/80">
                  <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    <Play size={22} className="text-white ml-1" />
                  </div>
                  <span className="text-xs font-bold">
                    Click to play session recording
                  </span>
                </div>
                {/* Cue card overlay */}
                <div className="absolute right-4 top-4 bg-black/60 rounded-xl px-4 py-3 text-white max-w-[180px]">
                  <p className="text-[11px] font-black mb-2 text-white/80 uppercase tracking-wider">
                    The Future of Work
                  </p>
                  <ul className="flex flex-col gap-1">
                    {[
                      "Automation and AI transformation",
                      "Remote work and digital collaboration",
                      "Skills of the future",
                      "Adapting to change",
                    ].map((t, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-[10px] text-white/70 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50 mt-1 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-4 pb-3 pt-6">
                <div className="flex items-center gap-3 text-white mb-2">
                  <Play
                    size={14}
                    className="cursor-pointer hover:text-white/70"
                  />
                  <span className="text-[10px] font-mono font-bold">
                    05:38 / 12:45
                  </span>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />{" "}
                    Eye Contact Drop
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-yellow-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />{" "}
                    Distraction Moment
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar details */}
          <div className="col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border-bold p-5 flex flex-col gap-4">
              <h3 className="font-black text-slate-800 text-sm">
                Eye Focus Events
              </h3>
              <div className="flex flex-col gap-2.5">
                {KEY_MOMENTS.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-black text-slate-400 w-10 shrink-0">
                        {m.time}
                      </span>
                      <Icon size={12} className={`${m.iconClass} shrink-0`} />
                      <span className="text-xs text-slate-600 font-medium flex-1">
                        {m.label}
                      </span>
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
      )}

      {/* ── Tab 2: Pace & Tempo ── */}
      {activeTab === "tempo" && (
        <div className="grid grid-cols-12 gap-4 animate-fade-in">
          {/* Main Tempo View */}
          <div className="col-span-8 bg-white rounded-2xl border-bold p-5 flex flex-col gap-5">
            <div>
              <h2 className="font-black text-slate-800 text-sm">
                Speaking Pace over Time
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Ideal speaking speed for presentations is between 100 - 130 WPM.
              </p>
            </div>

            {/* CSS Bar Chart */}
            <div className="bg-slate-50 border-2 border-slate-200/50 rounded-xl p-5 flex flex-col justify-between h-56">
              {/* Bars */}
              <div className="flex items-end justify-between h-40 px-4 border-b-2 border-slate-200">
                {PACE_SEGMENTS.map((seg, i) => {
                  const maxWpm = 200;
                  const pct = Math.min((seg.wpm / maxWpm) * 100, 100);
                  const isRed = seg.wpm > 150;
                  const isOrange = seg.wpm > 130 && seg.wpm <= 150;
                  const barBg = isRed
                    ? "bg-red-500"
                    : isOrange
                      ? "bg-orange-500"
                      : "bg-green-500";
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 w-12 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {seg.wpm} WPM ({seg.status})
                      </div>

                      {/* Bar fill */}
                      <div
                        className={`w-8 ${barBg} rounded-t-md transition-all duration-500`}
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-400 leading-none">
                        {seg.time.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{" "}
                  Ideal Pace (100 - 130 WPM)
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />{" "}
                  Warning (130 - 150 WPM)
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{" "}
                  Fast / Slow (&gt;150 WPM)
                </span>
              </div>
            </div>

          </div>

          {/* Right sidebar pace summary */}
          <div className="col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border-bold p-5 flex flex-col gap-4">
              <h3 className="font-black text-slate-800 text-sm">
                Speaking Pace Segments
              </h3>
              <div className="flex flex-col gap-3">
                {PACE_SEGMENTS.map((seg, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 font-mono">
                        {seg.time}
                      </span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5">
                        {seg.wpm} Words / Min
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md ${seg.bg} ${seg.color}`}
                    >
                      {seg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Filler Words ── */}
      {activeTab === "filler" && (
        <div className="grid grid-cols-12 gap-4 animate-fade-in">
          {/* Main Filler Words View */}
          <div className="col-span-12 bg-white rounded-2xl border-bold p-5 flex flex-col gap-5">
            {/* Filler Words Transcript Logs */}
            <div>
              <h2 className="font-black text-slate-800 text-sm mb-3">
                Filler Word Incidents in Transcript
              </h2>
              <div className="flex flex-col gap-2">
                {FILLER_EVENTS.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Used word:{" "}
                        <span className="text-red-500 font-black">
                          "{event.word}"
                        </span>
                      </p>
                      <p className="text-xs text-slate-700 mt-1 italic font-medium leading-relaxed">
                        {event.phrase
                          .split(`*${event.word}*`)
                          .map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                              {part}
                              {idx < arr.length - 1 && (
                                <span className="text-red-500 bg-red-50 border-b-2 border-red-300 font-black px-1 rounded not-italic">
                                  {event.word}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Wordiness ── */}
      {activeTab === "wordiness" && (
        <div className="grid grid-cols-12 gap-4 animate-fade-in">
          {/* Main Wordiness View */}
          <div className="col-span-12 bg-white rounded-2xl border-bold p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-slate-800 ">
                Wordiness Analysis & Pleonasm Correction
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Simplifying complex/redundant phrases improves message clarity
                and increases audience engagement.
              </p>
            </div>

            {/* List of wordy phrases */}
            <div className="flex flex-col gap-4">
              {WORDINESS_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {/* Left: Original redundant phrase */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Wordy Phrase
                        </span>
                        <span className="text-sm font-extrabold text-red-500 line-through bg-red-50/50 border border-red-100 rounded px-2.5 py-1 mt-1">
                          {item.original}
                        </span>
                      </div>

                      {/* Right: Suggested replacement */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Recommended
                        </span>
                        <span className="text-sm font-bold text-green-600 bg-green-50 border border-green-100 rounded px-2.5 py-1 mt-1">
                          {item.improved}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
                      Pleonasm
                    </span>
                  </div>

                  {/* Context sentence */}
                  <div className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                    <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">
                      Transcript Context
                    </span>
                    <span>
                      {item.context
                        .split(`*${item.original}*`)
                        .map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <span className="text-red-500 font-bold underline decoration-2">
                                {item.original}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                    </span>
                  </div>

                  {/* Explanation footnote */}
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    💡 <strong>Coach Tip:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
