"use client";

// src/app/interview/result/page.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  AudioLines,
  Timer,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Zap,
  MessageSquare,
  Star,
  Target,
  Loader2,
  CircleAlert,
  AlertTriangle,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { getSessionVideo, getSessionClips } from "@/utils/videoStorage";
import { saveSession, uploadClip } from "@/lib/api";

// ── Tabs ────────────────────────────────────────────────────
const TABS = [
  { id: "distraction", label: "Distraction", icon: Eye },
  { id: "wpm", label: "WPM", icon: TrendingUp },
  { id: "filler", label: "Filler Words", icon: AudioLines },
  { id: "wordiness", label: "Wordiness", icon: FileText },
  { id: "ai_review", label: "AI Review", icon: Star },
];

// ── Score Ring ──────────────────────────────────────────────
function ScoreRing({ score, size = 120, strokeWidth = 10, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
      </div>
      {label && <span className="text-xs font-bold text-slate-500">{label}</span>}
      {sublabel && (
        <span className="text-[10px] text-slate-400">{sublabel}</span>
      )}
    </div>
  );
}

// ── Mini Bar Chart ──────────────────────────────────────────
function MiniBar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Formatting helpers ──────────────────────────────────────
function formatTime(secs) {
  if (secs == null || isNaN(secs)) return "00:00";
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(secs) {
  if (secs == null || isNaN(secs)) return "0.0s";
  return `${secs.toFixed(1)}s`;
}

// ── Clip Video Player (handles both real clips and timeline-windowed) ──
function ClipVideoPlayer({ clip, onClipEnded }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const isRealClip = clip?.isRealClip === true;
  const clipDuration = clip?.clipDuration || 0;
  const clipStart = clip?.clipStart || 0;
  const clipEnd = clip?.clipEnd || 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;
    if (isRealClip) {
      video.currentTime = 0;
    } else {
      video.currentTime = clipStart;
    }
    setCurrentTime(0);
    setPlaying(false);
  }, [clip, clipStart, isRealClip]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tick = setInterval(() => {
      if (video && !video.paused) {
        if (isRealClip) {
          setCurrentTime(video.currentTime);
          if (video.currentTime >= video.duration && video.duration > 0) {
            video.pause();
            setPlaying(false);
            setCurrentTime(video.duration);
            onClipEnded?.();
          }
        } else {
          const ct = video.currentTime - clipStart;
          setCurrentTime(Math.max(0, ct));
          if (video.currentTime >= clipEnd) {
            video.pause();
            setPlaying(false);
            setCurrentTime(clipDuration);
            onClipEnded?.();
          }
        }
      }
    }, 100);
    return () => clearInterval(tick);
  }, [clipStart, clipEnd, clipDuration, onClipEnded, isRealClip]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      if (isRealClip) {
        if (video.ended || video.currentTime >= video.duration - 0.1) {
          video.currentTime = 0;
        }
      } else {
        if (video.currentTime >= clipEnd) video.currentTime = clipStart;
      }
      video.play().catch(() => {});
      setPlaying(true);
    }
  };

  const dur = isRealClip ? (videoRef.current?.duration || clipDuration || 6) : clipDuration;
  const progressPct = dur > 0 ? (currentTime / dur) * 100 : 0;

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden group">
      <video ref={videoRef} src={clip?.clipUrl || ""} className="absolute inset-0 w-full h-full object-contain" muted={false} playsInline />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={togglePlay}>
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play size={22} className="text-white ml-1" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-4 pb-3 pt-8 z-10">
        <div className="w-full h-1.5 bg-white/20 rounded-full mb-2">
          <div className="h-full bg-main rounded-full transition-[width] duration-75" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <span className="text-[10px] font-mono font-bold">
            {formatTime(currentTime)} / {formatTime(dur)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Clip Card ───────────────────────────────────────────────
function ClipCard({ clip, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isActive ? "border-main bg-blue-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="w-16 aspect-video shrink-0 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center">
        <Film size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-black text-slate-400">
            {formatTime(clip.timestamp)}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">
            Look Away
          </span>
        </div>
      </div>
      <button
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isActive ? "bg-main text-white" : "bg-slate-100 text-slate-400 hover:bg-main/10"
        }`}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <Play size={9} className="ml-0.5" />
      </button>
    </div>
  );
}

// ── Interview Pace Chart (matching presentation result style) ─
function InterviewPaceChart({ questions, averageWpm }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  const maxWpm = Math.max(...questions.map((q) => q.wpm || 0), 180);

  // Compute trend
  const halfN = Math.floor(questions.length / 2) || 1;
  const firstHalf = questions.slice(0, halfN);
  const secondHalf = questions.slice(halfN);
  const firstAvg =
    firstHalf.length > 0
      ? firstHalf.reduce((s, q) => s + (q.wpm || 0), 0) / firstHalf.length
      : 0;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((s, q) => s + (q.wpm || 0), 0) / secondHalf.length
      : 0;
  const trend =
    secondAvg > firstAvg ? "up" : secondAvg < firstAvg ? "down" : "stable";

  const getBarColor = (wpm) => {
    if (wpm <= 0) return "bg-slate-200";
    if (wpm > 150) return "bg-red-500";
    if (wpm >= 130) return "bg-orange-400";
    if (wpm >= 100) return "bg-green-500";
    return "bg-blue-400";
  };

  const getStatusLabel = (wpm) => {
    if (wpm <= 0) return "No Speech";
    if (wpm > 150) return "Too Fast";
    if (wpm >= 130) return "Slightly Fast";
    if (wpm >= 100) return "Ideal";
    return "Too Slow";
  };

  const chartHeight = 200;
  const idealTop = maxWpm > 0 ? ((maxWpm - 130) / maxWpm) * chartHeight : 0;
  const idealBottom = maxWpm > 0 ? ((maxWpm - 100) / maxWpm) * chartHeight : 0;
  const avgLineY = maxWpm > 0 ? ((maxWpm - (averageWpm || 0)) / maxWpm) * chartHeight : 0;

  return (
    <div className="bg-slate-50 border-2 border-slate-200/50 rounded-xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            WPM Per Question
          </span>
          <span
            className={`text-xs font-black flex items-center gap-1 ${
              trend === "up"
                ? "text-orange-500"
                : trend === "down"
                  ? "text-blue-500"
                  : "text-slate-400"
            }`}
          >
            {trend === "up" ? (
              <><TrendingUp size={14} /> Speeding Up</>
            ) : trend === "down" ? (
              <><TrendingDown size={14} /> Slowing Down</>
            ) : (
              <><Minus size={14} /> Stable</>
            )}
          </span>
        </div>
        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400">Avg</span>
          <span className="text-sm font-black text-slate-800">{averageWpm || 0}</span>
          <span className="text-[9px] font-bold text-slate-400">WPM</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-0 w-7 flex flex-col justify-between text-[9px] font-bold text-slate-300 pointer-events-none">
          <span>{maxWpm}</span>
          <span>{Math.round(maxWpm / 2)}</span>
          <span>0</span>
        </div>

        <div className="relative ml-8 mr-2 h-full">
          {/* Grid */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-slate-200/60" />
            <div className="border-t border-slate-200/60" />
            <div className="border-t border-slate-200/60" />
          </div>

          {/* Ideal Zone */}
          <div
            className="absolute left-0 right-0 bg-green-100/50 border-y border-green-200/40 rounded-sm pointer-events-none transition-all duration-700"
            style={{ top: `${Math.max(0, idealTop)}px`, height: `${Math.max(4, idealBottom - idealTop)}px` }}
          >
            <span className="absolute -top-3 right-0 text-[8px] font-bold text-green-500/70 tracking-wider">
              IDEAL ZONE
            </span>
          </div>

          {/* Average line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-slate-400/50 pointer-events-none transition-all duration-700"
            style={{ top: `${Math.max(0, avgLineY)}px` }}
          >
            <span className="absolute -top-2.5 right-0 text-[8px] font-bold text-slate-400">avg</span>
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around pb-1">
            {questions.map((q, i) => {
              const wpm = q.wpm || 0;
              const barHeight = maxWpm > 0 ? (wpm / maxWpm) * (chartHeight - 20) : 0;
              const isSelected = selectedQuestion === i;

              return (
                <div key={i} className="flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div
                    className={`absolute bottom-full mb-2 transition-all duration-200 z-20 ${
                      isSelected
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none"
                    }`}
                  >
                    <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{wpm} WPM</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                            wpm > 150 ? "bg-red-500/20 text-red-300"
                            : wpm >= 130 ? "bg-orange-500/20 text-orange-300"
                            : wpm >= 100 ? "bg-green-500/20 text-green-300"
                            : wpm > 0 ? "bg-blue-500/20 text-blue-300"
                            : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {getStatusLabel(wpm)}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-400 mt-1">
                        Question {q.question_number || i + 1}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
                  </div>

                  {/* Bar */}
                  <button
                    onClick={() => setSelectedQuestion(isSelected ? null : i)}
                    className={`w-10 md:w-14 rounded-t-md transition-all duration-500 cursor-pointer relative focus:outline-none ${
                      getBarColor(wpm)
                    } ${isSelected ? "ring-2 ring-offset-2 ring-slate-600 scale-110" : "hover:brightness-110"}`}
                    style={{
                      height: animateIn ? `${Math.max(barHeight, 4)}px` : "0px",
                      transitionDelay: `${i * 80}ms`,
                    }}
                  >
                    {barHeight > 32 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/60 pointer-events-none">
                        {wpm}
                      </span>
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={`text-[9px] font-bold mt-1.5 transition-colors ${
                      isSelected ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    Q{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedQuestion !== null && questions[selectedQuestion] && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700">
              Question {selectedQuestion + 1} Details
            </span>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <span className="block text-lg font-black text-slate-800">
                {questions[selectedQuestion].wpm || 0}
              </span>
              <span className="text-[9px] font-bold text-slate-400">WPM</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-black text-slate-800">
                {questions[selectedQuestion].answer_duration_seconds || 0}s
              </span>
              <span className="text-[9px] font-bold text-slate-400">Duration</span>
            </div>
            <div className="text-center">
              <span
                className={`block text-lg font-black ${
                  (questions[selectedQuestion].wpm || 0) > 150 ? "text-red-500"
                  : (questions[selectedQuestion].wpm || 0) >= 130 ? "text-orange-500"
                  : (questions[selectedQuestion].wpm || 0) >= 100 ? "text-green-600"
                  : (questions[selectedQuestion].wpm || 0) > 0 ? "text-blue-500"
                  : "text-slate-400"
                }`}
              >
                {getStatusLabel(questions[selectedQuestion].wpm || 0)}
              </span>
              <span className="text-[9px] font-bold text-slate-400">Status</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" /> Too Slow (&lt;100)
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Ideal (100–130)
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-sm bg-orange-400 inline-block" /> Slightly Fast (130–150)
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Too Fast (&gt;150)
        </span>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function InterviewResultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("distraction");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // ── Clip state ────────────────────────────────────────────
  const [clips, setClips] = useState([]);
  const [activeClipIndex, setActiveClipIndex] = useState(-1);
  const [videoUrl, setVideoUrl] = useState(null);
  const blobUrlsRef = useRef([]); // track all blob URLs for cleanup

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const raw = sessionStorage.getItem("interview_results");
        if (!raw) {
          setError("No interview results found. Please complete an interview session first.");
          setLoading(false);
          return;
        }
        const data = JSON.parse(raw);
        setResultData(data);

        // Load real clips from IndexedDB (extracted at session end)
        let realClipsLoaded = false;
        try {
          const storedClips = await getSessionClips();
          if (storedClips.length > 0) {
            const events = data.lookAwayEvents || [];
            const realClips = storedClips.map((storedClip, i) => {
              const blobUrl = URL.createObjectURL(storedClip.blob);
              blobUrlsRef.current.push(blobUrl);
              const matchingEvent = events.find((e) => e.id === storedClip.id) || {};
              return {
                id: storedClip.id || `clip-${i}`,
                timestamp: storedClip.timestamp || matchingEvent.timestamp || 0,
                type: storedClip.type || matchingEvent.type || "Look Away",
                duration: storedClip.duration || matchingEvent.duration || 0,
                clipDuration: 6,
                clipUrl: blobUrl,
                isRealClip: true,
              };
            });
            setClips(realClips);
            realClipsLoaded = true;
          }
        } catch (e) {
          console.warn("Failed to load clips from IndexedDB, falling back to full video:", e);
        }

        // Fallback: if no real clips, use full video + timeline windowing
        if (!realClipsLoaded) {
          try {
            const blob = await getSessionVideo();
            if (blob) {
              const url = URL.createObjectURL(blob);
              blobUrlsRef.current.push(url);
              setVideoUrl(url);

              const events = data.lookAwayEvents || [];
              const extracted = events.map((evt) => {
                const ts = evt.timestamp || 0;
                const clipStart = Math.max(0, ts - 3);
                const clipEnd = ts + 3;
                return {
                  id: evt.id,
                  timestamp: ts,
                  type: evt.type || "Look Away",
                  duration: evt.duration || 0,
                  clipStart,
                  clipEnd,
                  clipDuration: clipEnd - clipStart,
                  clipUrl: url,
                  isRealClip: false,
                };
              });
              setClips(extracted);
            }
          } catch (e) {
            console.warn("No session video available:", e);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load results:", err);
        setError("Failed to load interview results.");
        setLoading(false);
      }
    }
    load();

    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  const perQuestionData = resultData?.per_question_data || [];
  const evaluateData = resultData?.evaluate_response?.data || resultData?.evaluate_response || {};
  const qaAnalysis = evaluateData?.qa_analysis || [];
  const overallScore = evaluateData?.overall_interview_score ?? 0;
  const metricsSummary = evaluateData?.metrics_summary || {};

  // ── Save session to backend ─────────────────────────────────
  const hasPostedRef = React.useRef(false);

  useEffect(() => {
    if (loading || error || !resultData || hasPostedRef.current) return;
    hasPostedRef.current = true;

    async function postSession() {
      try {
        // Collect filler incidents across all questions
        const allFillerIncidents = [];
        perQuestionData.forEach((q) => {
          const analysis = q.speech_analysis;
          const incidents =
            analysis?.analysis?.filler_words?.incidents ||
            analysis?.filler_words?.incidents ||
            [];
          incidents.forEach((inc) => {
            allFillerIncidents.push({
              word: inc.word,
              context_text: inc.context_text || "",
            });
          });
        });

        // Collect wordiness findings across all questions
        const allWordFindings = [];
        perQuestionData.forEach((q) => {
          const analysis = q.speech_analysis;
          const findings =
            analysis?.analysis?.word_efficiency?.findings ||
            analysis?.word_efficiency?.findings ||
            [];
          findings.forEach((f) => {
            allWordFindings.push({
              issue_type: f.issue_type || "Pleonasm",
              original_phrase: f.original_phrase || "",
              recommended_phrase: f.recommended_phrase || "",
              transcript_context: f.transcript_context || "",
              coach_tip: f.coach_tip || "",
            });
          });
        });

        // Upload distraction clips to get video_urls
        const distractionClips = [];
        try {
          const storedClips = await getSessionClips();
          for (const clip of storedClips) {
            try {
              const ts = Math.round(clip.timestamp || 0);
              const dur = Math.round(clip.duration || 0);
              const uploadResult = await uploadClip(clip.blob, {
                type: clip.type || "Look Away",
                timestamp: ts,
                duration: dur,
              });

              if (uploadResult?.video_url) {
                distractionClips.push({
                  video_url: uploadResult.video_url,
                  type: clip.type || "Look Away",
                  timestamp: ts,
                  duration: dur,
                });
              }
            } catch (clipErr) {
              console.warn("Clip upload failed:", clipErr);
            }
          }
        } catch (e) {
          console.warn("Failed to load clips for upload:", e);
        }

        // Build interview_details from qaAnalysis
        const interviewDetails = qaAnalysis.map((qa, i) => {
          const qData = perQuestionData[i] || {};
          return {
            question_number: qa.question_number || qData.question_number || i + 1,
            question_text: qa.question_text || qData.question_text || "",
            user_answer: qa.user_answer || qData.user_answer || "",
            duration: qData.answer_duration_seconds ?? 0,
            relevancy_score: qa.scores?.relevancy_score ?? qa.relevancy_score ?? 0,
            star_structure_score: qa.scores?.star_structure_score ?? qa.star_structure_score ?? 0,
            overall_answer_score: qa.scores?.overall_answer_score ?? qa.overall_answer_score ?? 0,
            strengths: qa.feedback?.strengths || qa.strengths || "",
            weaknesses: qa.feedback?.weaknesses || qa.weaknesses || "",
            recommended_answer: qa.feedback?.recommended_answer_improvement || qa.recommended_answer || "",
          };
        });

        const jobTitle = sessionStorage.getItem("interview_job_title") || "";

        const payload = {
          name: jobTitle ? `Interview: ${jobTitle}` : "Interview Session",
          practice_type: "INTERVIEW",
          document_id:
            resultData.document_id ||
            resultData.documentId ||
            sessionStorage.getItem("interview_document_id") ||
            "",
          job_title: jobTitle,
          job_desc: sessionStorage.getItem("interview_job_desc") || "",
          question_count: perQuestionData.length,
          distract_count: (resultData.lookAwayEvents || []).length,
          total_distract_duration: perQuestionData.reduce(
            (s, q) => s + (q.distract_duration_seconds || 0),
            0
          ),
          total_duration: perQuestionData.reduce(
            (s, q) => s + (q.answer_duration_seconds || 0),
            0
          ),
          wpm:
            perQuestionData.length > 0
              ? Math.round(
                  perQuestionData.reduce((s, q) => s + (q.wpm || 0), 0) /
                    perQuestionData.length
                )
              : 0,
          efficiency_score: evaluateData.efficiency_score ?? 0,
          overall_score: overallScore,
          filler_incidents: allFillerIncidents,
          word_findings: allWordFindings,
          interview_details: interviewDetails,
          distraction_clips: distractionClips,
        };

        await saveSession(payload);
      } catch (err) {
        console.warn("Failed to save interview session to history:", err);
      }
    }

    postSession();
  }, [loading, error, resultData, perQuestionData, evaluateData, qaAnalysis, overallScore]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-main animate-spin" />
          <span className="text-sm font-bold text-slate-400">Loading results…</span>
        </div>
      </div>
    );
  }

  // ── Error / no data ────────────────────────────────────────
  if (error || !resultData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <CircleAlert size={40} className="text-red-400" />
          <p className="text-sm font-bold text-slate-700">{error || "No results found."}</p>
          <Link
            href="/interview/setup"
            className="text-sm font-bold text-main underline"
          >
            Go to Interview Setup
          </Link>
        </div>
      </div>
    );
  }

  // ── Active tab icon ────────────────────────────────────────
  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon || Eye;

  return (
    <div className="w-full min-h-screen pb-16 font-sans text-slate-800">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <p className="text-slate-500 text-sm">
            Review your performance across {perQuestionData.length} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/interview/setup">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5 font-bold">
              <RotateCcw size={14} />
              Practice Again
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Score Overview ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Overall Score */}
        <div className="bg-white border-bold p-5 flex flex-col items-center">
          <ScoreRing score={overallScore} size={100} strokeWidth={8} label="Overall Score" />
        </div>

        {/* Metric: Filler Words */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <AudioLines size={20} className="text-orange-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.total_filler_words ?? perQuestionData.reduce((s, q) => s + (q.filler_words_count || 0), 0)}
          </span>
          <span className="text-xs font-bold text-slate-400">Total Filler Words</span>
        </div>

        {/* Metric: Distraction */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <Eye size={20} className="text-blue-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.total_distract_duration ?? perQuestionData.reduce((s, q) => s + (q.distract_duration_seconds || 0), 0)}s
          </span>
          <span className="text-xs font-bold text-slate-400">Total Distracted</span>
        </div>

        {/* Metric: Average WPM */}
        <div className="bg-white border-bold p-5 flex flex-col items-center justify-center gap-2">
          <Timer size={20} className="text-green-500" />
          <span className="text-2xl font-black text-slate-800">
            {metricsSummary.average_wpm ?? (perQuestionData.length > 0
              ? Math.round(perQuestionData.reduce((s, q) => s + (q.wpm || 0), 0) / perQuestionData.length)
              : 0)}
          </span>
          <span className="text-xs font-bold text-slate-400">Average WPM</span>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────── */}
      <div className="flex border-b-2 border-slate-200 mb-5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-main text-main"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="bg-white border-bold p-5">
        {/* Tab 1: Distraction */}
        {activeTab === "distraction" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Distraction Timeline</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No distraction data available.</p>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Video Player + Clips */}
                {clips.length > 0 && (
                  <div className="lg:w-[420px] shrink-0 flex flex-col gap-4">
                    {/* Video Player */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        {activeClipIndex >= 0
                          ? `Clip ${activeClipIndex + 1} of ${clips.length}`
                          : "Select a clip to play"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveClipIndex((p) => Math.max(-1, p - 1))}
                          disabled={activeClipIndex <= -1}
                          className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 px-1">
                          {activeClipIndex + 1}/{clips.length}
                        </span>
                        <button
                          onClick={() => setActiveClipIndex((p) => Math.min(clips.length - 1, p + 1))}
                          disabled={activeClipIndex >= clips.length - 1}
                          className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <ClipVideoPlayer
                      clip={activeClipIndex >= 0 ? clips[activeClipIndex] : null}
                      onClipEnded={() => {
                        if (activeClipIndex < clips.length - 1) {
                          setActiveClipIndex((p) => p + 1);
                        }
                      }}
                    />

                    {/* Clip List */}
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                      {clips.map((clip, i) => (
                        <ClipCard
                          key={clip.id || i}
                          clip={clip}
                          isActive={i === activeClipIndex}
                          onClick={() => setActiveClipIndex(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Right: Distraction Summary + Timeline */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                  {/* Per-Question Cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {perQuestionData.map((q, i) => {
                      const secs = q.distract_duration_seconds || 0;
                      const maxDistract = Math.max(...perQuestionData.map((d) => d.distract_duration_seconds || 0), 1);
                      const barColor =
                        secs === 0
                          ? "bg-green-500"
                          : secs <= 3 ? "bg-blue-500"
                          : secs <= 8 ? "bg-orange-400"
                          : "bg-red-500";
                      return (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-600">Q {q.question_number || i + 1}</span>
                            <span className={`text-xs font-black ${secs === 0 ? "text-green-600" : "text-slate-700"}`}>
                              {secs === 0 ? "Perfect Focus!" : `${secs}s distracted`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${maxDistract > 0 ? (secs / maxDistract) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-slate-200 pt-4">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 block">
                      Distraction Events Timeline
                    </span>
                    <div className="flex flex-col">
                      {perQuestionData.map((q, i) => {
                        const secs = q.distract_duration_seconds || 0;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
                                  secs === 0 ? "border-green-400 bg-green-100"
                                  : secs <= 3 ? "border-blue-400 bg-blue-100"
                                  : secs <= 8 ? "border-orange-400 bg-orange-100"
                                  : "border-red-400 bg-red-100"
                                }`}
                              />
                              {i < perQuestionData.length - 1 && (
                                <div className="w-px flex-1 border-l-2 border-dashed border-slate-200 my-1 min-h-8" />
                              )}
                            </div>
                            <div className="pb-5">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-700">Question {q.question_number || i + 1}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  secs === 0 ? "bg-green-50 text-green-600"
                                  : secs <= 3 ? "bg-blue-50 text-blue-600"
                                  : secs <= 8 ? "bg-orange-50 text-orange-600"
                                  : "bg-red-50 text-red-600"
                                }`}>
                                  {secs === 0 ? "No Distraction" : `${secs}s`}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {secs === 0
                                  ? "You maintained perfect eye contact throughout this question."
                                  : secs <= 3 ? "Minor distraction — you stayed mostly focused."
                                  : secs <= 8 ? "Moderate distraction — your focus slipped a few times."
                                  : "Significant distraction — try to maintain eye contact with the interviewer."}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-500">Total Distracted Time</span>
                      <span className="font-black text-slate-700">
                        {perQuestionData.reduce((s, q) => s + (q.distract_duration_seconds || 0), 0)}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: WPM */}
        {activeTab === "wpm" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Speaking Pace Analysis</h3>
            {perQuestionData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No WPM data available.</p>
            ) : (
              <InterviewPaceChart
                questions={perQuestionData}
                averageWpm={
                  perQuestionData.length > 0
                    ? Math.round(perQuestionData.reduce((s, q) => s + (q.wpm || 0), 0) / perQuestionData.length)
                    : 0
                }
              />
            )}
          </div>
        )}

        {/* Tab 3: Filler Words */}
        {activeTab === "filler" && (() => {
          // Collect all filler incidents across all questions
          const allFillerIncidents = [];
          perQuestionData.forEach((q) => {
            const analysis = q.speech_analysis;
            const incidents =
              analysis?.analysis?.filler_words?.incidents ||
              analysis?.filler_words?.incidents ||
              [];
            incidents.forEach((inc) => {
              const phrase = inc.context_text
                ? inc.context_text.replace(
                    new RegExp("\\b(" + inc.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "gi"),
                    "*$1*"
                  )
                : "";
              allFillerIncidents.push({ word: inc.word.toLowerCase(), phrase, questionNumber: q.question_number });
            });
          });
          const hasFiller = allFillerIncidents.length > 0;
          const hasAnyAnalysis = perQuestionData.some((q) => q.speech_analysis);

          return (
            <div>
              <h2 className="font-black text-slate-800 text-sm mb-3">
                Filler Word Incidents in Transcript
              </h2>
              {!hasAnyAnalysis && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <AudioLines size={40} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-400">No Filler Word Analysis Available</span>
                  <span className="text-xs text-slate-300">Filler word analysis requires microphone access during your session.</span>
                </div>
              )}
              {hasAnyAnalysis && !hasFiller && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <CheckCircle size={40} className="text-green-400" />
                  <span className="text-sm font-bold text-green-600">No Filler Words Detected</span>
                  <span className="text-xs text-slate-400">Great job! Your speech was clean and free of filler words.</span>
                </div>
              )}
              {hasFiller && (
                <div className="flex flex-col gap-2">
                  {allFillerIncidents.map((event, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Q{event.questionNumber} — Used word:{" "}
                          <span className="text-red-500 font-black">&ldquo;{event.word}&rdquo;</span>
                        </p>
                        {event.phrase && (
                          <p className="text-xs text-slate-700 mt-1 italic font-medium leading-relaxed">
                            {event.phrase.split("*" + event.word + "*").map((part, idx, arr) => (
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 4: Wordiness */}
        {activeTab === "wordiness" && (() => {
          // Collect all wordiness findings across all questions
          const allFindings = [];
          perQuestionData.forEach((q) => {
            const analysis = q.speech_analysis;
            const findings =
              analysis?.analysis?.word_efficiency?.findings ||
              analysis?.word_efficiency?.findings ||
              [];
            findings.forEach((f) => {
              const original = f.original_phrase || "";
              const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const highlighted = f.transcript_context
                ? f.transcript_context.replace(
                    new RegExp("\\b(" + escaped + ")\\b", "gi"),
                    "*$1*"
                  )
                : "";
              allFindings.push({
                original,
                improved: f.recommended_phrase,
                context: highlighted,
                explanation: f.coach_tip,
                issueType: f.issue_type || "Pleonasm",
                questionNumber: q.question_number,
              });
            });
          });
          const hasWordiness = allFindings.length > 0;
          const hasAnyAnalysis = perQuestionData.some((q) => q.speech_analysis);

          return (
            <div>
              <h2 className="font-bold text-slate-800">Wordiness Analysis & Pleonasm Correction</h2>
              <p className="text-sm text-slate-500 mt-1">
                Simplifying complex/redundant phrases improves message clarity and increases engagement.
              </p>

              {!hasAnyAnalysis && (
                <div className="flex flex-col items-center gap-3 py-12 mt-4">
                  <FileText size={40} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-400">No Wordiness Analysis Available</span>
                  <span className="text-xs text-slate-300">Wordiness analysis requires microphone access during your session.</span>
                </div>
              )}
              {hasAnyAnalysis && !hasWordiness && (
                <div className="flex flex-col items-center gap-3 py-12 mt-4">
                  <CheckCircle size={40} className="text-green-400" />
                  <span className="text-sm font-bold text-green-600">No Wordiness Issues Detected</span>
                  <span className="text-xs text-slate-400">Your speech was concise and efficient — no redundant phrases found.</span>
                </div>
              )}
              {hasWordiness && (
                <div className="flex flex-col gap-4 mt-4">
                  {allFindings.map((item, i) => (
                    <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wordy Phrase</span>
                            <span className="text-sm font-extrabold text-red-500 line-through bg-red-50/50 border border-red-100 rounded px-2.5 py-1 mt-1">
                              {item.original}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended</span>
                            <span className="text-sm font-bold text-green-600 bg-green-50 border border-green-100 rounded px-2.5 py-1 mt-1">
                              {item.improved}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 shrink-0">
                          Q{item.questionNumber} · {item.issueType || "Pleonasm"}
                        </span>
                      </div>
                      {item.context && (
                        <div className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">Transcript Context</span>
                          <span>
                            {item.context.split("*" + item.original + "*").map((part, idx, arr) => (
                              <React.Fragment key={idx}>
                                {part}
                                {idx < arr.length - 1 && (
                                  <span className="text-red-500 font-bold underline decoration-2">{item.original}</span>
                                )}
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        💡 <strong>Coach Tip:</strong> {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 5: AI Review Carousel */}
        {activeTab === "ai_review" && (
          <div>
            <h3 className="font-bold text-lg mb-4">AI Review Per Question</h3>
            {qaAnalysis.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No AI review data available. Complete a full session to get AI feedback.
              </p>
            ) : (
              <AIReviewCarousel qaAnalysis={qaAnalysis} perQuestionData={perQuestionData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Review Carousel ──────────────────────────────────────
function AIReviewCarousel({ qaAnalysis, perQuestionData }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = qaAnalysis.length;
  const current = qaAnalysis[activeIdx] || {};
  const questionData = perQuestionData[activeIdx] || {};

  const goPrev = () => setActiveIdx((p) => Math.max(0, p - 1));
  const goNext = () => setActiveIdx((p) => Math.min(total - 1, p + 1));

  return (
    <div className="flex flex-col gap-5">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="p-2 rounded-lg border-2 border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-500">
          Question {current.question_number || activeIdx + 1} / {total}
        </span>
        <button
          onClick={goNext}
          disabled={activeIdx === total - 1}
          className="p-2 rounded-lg border-2 border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Question & Answer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
          Question
        </p>
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          {current.question_text || questionData.question_text || "N/A"}
        </p>
      </div>

      <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
        <p className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1">
          Your Answer
        </p>
        <p className="text-sm text-slate-700 leading-snug">
          {current.user_answer || questionData.user_answer || "No answer recorded."}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border-bold text-center">
          <Target size={16} className="text-blue-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.relevancy_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Relevancy</span>
        </div>
        <div className="p-4 bg-white border-bold text-center">
          <Star size={16} className="text-amber-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.star_structure_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">STAR Method</span>
        </div>
        <div className="p-4 bg-white border-bold text-center">
          <MessageSquare size={16} className="text-green-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.scores?.overall_answer_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Overall</span>
        </div>
      </div>

      {/* Feedback */}
      {current.feedback && (
        <div className="flex flex-col gap-3">
          {current.feedback.strengths && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-500 mb-1">
                Strengths
              </p>
              <p className="text-xs text-green-800 leading-relaxed">
                {current.feedback.strengths}
              </p>
            </div>
          )}
          {current.feedback.weaknesses && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
                Areas to Improve
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                {current.feedback.weaknesses}
              </p>
            </div>
          )}
          {current.feedback.recommended_answer_improvement && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">
                Recommended Improvement
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                {current.feedback.recommended_answer_improvement}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
