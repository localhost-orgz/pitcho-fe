"use client";

// src/app/session/[id]/page.js
// Session detail page — loads data from /api/history/:id and renders results
// for both PRESENTATION and INTERVIEW practice types.

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  AudioLines,
  Timer,
  Play,
  Pause,
  CheckCircle,
  Zap,
  Volume2,
  VolumeX,
  Maximize,
  Film,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  Star,
  Target,
  MessageSquare,
  Loader2,
  CircleAlert,
  X,
  TrendingUp,
} from "lucide-react";
import { fetchSession } from "@/lib/history";

// ── Utilities ────────────────────────────────────────────────────

function formatTime(secs) {
  if (secs == null || isNaN(secs)) return "00:00";
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(secs) {
  if (secs == null || isNaN(secs)) return "0.0s";
  return `${secs.toFixed(1)}s`;
}

function scoreToColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 85%, 50%)`;
}

// ── Score Ring ────────────────────────────────────────────────────

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
      {label && (
        <span className="text-xs font-bold text-slate-500">{label}</span>
      )}
      {sublabel && (
        <span className="text-[10px] text-slate-400">{sublabel}</span>
      )}
    </div>
  );
}

// ── Mini Bar ──────────────────────────────────────────────────────

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

// ── Custom Video Player (remote URLs, no IndexedDB) ───────────────

function CustomVideoPlayer({ clip, onClipEnded }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const clipDuration = clip?.clipDuration || 0;

  // Reset when clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;
    video.currentTime = 0;
    setCurrentTime(0);
    setPlaying(false);
    setVideoError(false);
  }, [clip]);

  // Sync currentTime from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (seeking) return;
      setCurrentTime(video.currentTime);
      if (video.currentTime >= video.duration && video.duration > 0) {
        video.pause();
        setPlaying(false);
        setCurrentTime(video.duration);
        if (onClipEnded) onClipEnded();
      }
    };

    const onLoaded = () => {
      setDuration(video.duration || clipDuration);
    };

    const onError = () => {
      setVideoError(true);
      setPlaying(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
  }, [clipDuration, seeking, onClipEnded]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !clip || videoError) return;
    if (video.paused || video.ended) {
      if (video.ended || video.currentTime >= video.duration - 0.1) {
        video.currentTime = 0;
        setCurrentTime(0);
      }
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [clip, videoError]);

  const handleSeek = useCallback(
    (e) => {
      const video = videoRef.current;
      const bar = progressRef.current;
      if (!video || !bar || !clip) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const dur = video.duration || clipDuration || 6;
      video.currentTime = Math.min(pct * dur, dur - 0.1);
      setCurrentTime(pct * dur);
    },
    [clip, clipDuration],
  );

  const handleProgressMouseDown = useCallback(
    (e) => {
      setSeeking(true);
      handleSeek(e);
      const onMove = (ev) => handleSeek(ev);
      const onUp = () => {
        setSeeking(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [handleSeek],
  );

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // No clip selected
  if (!clip) {
    return (
      <div className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Film size={40} />
          <span className="text-xs font-bold">Select a highlight to play</span>
        </div>
      </div>
    );
  }

  // Video failed to load
  if (videoError) {
    return (
      <div className="rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 relative aspect-video flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Film size={40} />
          <span className="text-xs font-bold">Video unavailable</span>
          <span className="text-[10px] text-slate-300">
            This clip could not be loaded. The URL may have expired.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video group cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={clip.clipUrl}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Clip label */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10">
        {clip.type}
      </div>

      {/* Center play button (when paused) */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play size={22} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-4 pb-3 pt-8 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2 relative"
          onMouseDown={handleProgressMouseDown}
        >
          <div
            className="h-full bg-main rounded-full relative transition-[width] duration-75"
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} className="hover:text-white/70 transition-colors">
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <span className="text-[10px] font-mono font-bold tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} className="hover:text-white/70 transition-colors">
              {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-white cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="hover:text-white/70 transition-colors">
            <Maximize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Clip Card ─────────────────────────────────────────────────────

function ClipCard({ clip, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isActive
          ? "border-main bg-blue-50/50 shadow-sm"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
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
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              clip.type?.includes("Eye") || clip.type?.includes("Head")
                ? "bg-blue-50 text-blue-600"
                : clip.type?.includes("Face out")
                  ? "bg-red-50 text-red-600"
                  : "bg-orange-50 text-orange-600"
            }`}
          >
            {clip.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500">
            Duration: {formatDuration(clip.duration)}
          </span>
        </div>
      </div>

      <button
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isActive
            ? "bg-main text-white"
            : "bg-slate-100 text-slate-400 hover:bg-main/10"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <Play size={9} className="ml-0.5" />
      </button>
    </div>
  );
}

// ── AI Review Carousel (Interview only) ──────────────────────────

function AIReviewCarousel({ interviewDetails }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = interviewDetails.length;
  const current = interviewDetails[activeIdx] || {};

  const goPrev = () => setActiveIdx((p) => Math.max(0, p - 1));
  const goNext = () => setActiveIdx((p) => Math.min(total - 1, p + 1));

  if (total === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No AI review data available.
      </p>
    );
  }

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
          Question {current.questionNumber || current.question_number || activeIdx + 1} / {total}
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
          {current.questionText || current.question_text || "N/A"}
        </p>
      </div>

      <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
        <p className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1">
          Your Answer
        </p>
        <p className="text-sm text-slate-700 leading-snug">
          {current.userAnswer || current.user_answer || current.recommendedAnswer || current.recommended_answer || "No answer recorded."}
        </p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl text-center">
          <Target size={16} className="text-blue-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.relevancyScore ?? current.relevancy_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Relevancy</span>
        </div>
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl text-center">
          <Star size={16} className="text-amber-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.starStructureScore ?? current.star_structure_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">STAR Method</span>
        </div>
        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl text-center">
          <MessageSquare size={16} className="text-green-500 mx-auto mb-1" />
          <span className="text-xl font-black text-slate-800 block">
            {current.overallAnswerScore ?? current.overall_answer_score ?? "-"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Overall</span>
        </div>
      </div>

      {/* Feedback */}
      {(current.strengths || current.strength) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-500 mb-1">
            Strengths
          </p>
          <p className="text-xs text-green-800 leading-relaxed">
            {current.strengths || current.strength}
          </p>
        </div>
      )}
      {(current.weaknesses || current.weakness) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
            Areas to Improve
          </p>
          <p className="text-xs text-red-700 leading-relaxed">
            {current.weaknesses || current.weakness}
          </p>
        </div>
      )}
      {(current.recommendedAnswer || current.recommended_answer) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">
            Recommended Improvement
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">
            {current.recommendedAnswer || current.recommended_answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Highlight helper for filler words ────────────────────────────

function highlightWord(text, word) {
  if (!word || !text) return text;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp("\\b(" + escaped + ")\\b", "gi"), "*$1*");
}

// ── Main Page Component ───────────────────────────────────────────

export default function SessionDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(null); // set after load
  const [activeClipIndex, setActiveClipIndex] = useState(-1);

  // ── Fetch session data ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSession(id);
        if (!cancelled) {
          setSession(data);
          // Set initial tab based on session type
          const rawType = data?.practiceType || data?.type || data?.practice_type || "";
          const isInterview = rawType.toLowerCase() === "interview";
          setActiveTab(isInterview ? "distraction" : "eye");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load session data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Derived data ────────────────────────────────────────────

  const sessionType = (session?.practiceType || session?.type || session?.practice_type || "").toLowerCase();
  const isInterview = sessionType === "interview";
  const isPresentation = sessionType === "presentation";

  // Clips: build from distractionClips using remote videoUrl
  const clips = React.useMemo(() => {
    const raw = session?.distractionClips || session?.distractionCases || session?.distraction_clips || [];
    return raw
      .filter((c) => c.video_url || c.videoUrl)
      .map((c, i) => ({
        id: c._id || c.id || `clip-${i}`,
        timestamp: c.timestamp || 0,
        type: c.type || "Distraction",
        duration: c.duration || 0,
        clipDuration: 6,
        clipUrl: c.videoUrl || c.video_url,
      }));
  }, [session]);

  // Filler incidents
  const fillerIncidents = React.useMemo(() => {
    const raw = session?.fillerIncidents || session?.filler_incidents || [];
    return raw.map((inc) => ({
      word: (inc.word || "").toLowerCase(),
      phrase: highlightWord(inc.contextText || inc.context_text || "", inc.word),
    }));
  }, [session]);

  // Wordiness findings
  const wordinessItems = React.useMemo(() => {
    const raw = session?.wordFindings || session?.word_findings || [];
    return raw.map((f) => ({
      original: f.originalPhrase || f.original_phrase || "",
      improved: f.recommendedPhrase || f.recommended_phrase || "",
      context: highlightWord(f.transcriptContext || f.transcript_context || "", f.originalPhrase || f.original_phrase || ""),
      explanation: f.coachTip || f.coach_tip || "",
      issueType: f.issueType || f.issue_type || "Pleonasm",
    }));
  }, [session]);

  // Interview details for AI Review
  const interviewDetails = session?.interviewDetails || session?.interview_details || [];

  // Word count from transcript
  const wordCount = React.useMemo(() => {
    const transcript = session?.transcript || "";
    if (!transcript) return 0;
    return transcript.split(/\s+/).filter(Boolean).length;
  }, [session]);

  // WPM status
  const wpm = session?.wpm || 0;
  const wpmStatus =
    wpm > 150 ? "Too Fast"
    : wpm >= 130 ? "Slightly Fast"
    : wpm >= 100 ? "Ideal Pace"
    : wpm > 0 ? "Too Slow"
    : "No Data";

  const wpmColor =
    wpm > 150 ? "bg-red-100 text-red-600"
    : wpm >= 130 ? "bg-orange-100 text-orange-600"
    : wpm >= 100 ? "bg-green-100 text-green-600"
    : wpm > 0 ? "bg-blue-100 text-blue-600"
    : "bg-slate-100 text-slate-400";

  // Date
  const sessionDate = (session?.createdAt || session?.created_at)
    ? new Date(session.createdAt || session.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // ── Tab config ──────────────────────────────────────────────

  const TABS = isInterview
    ? [
        { id: "distraction", label: "Distraction", icon: Eye },
        { id: "wpm", label: "WPM", icon: TrendingUp },
        { id: "filler", label: "Filler Words", icon: AudioLines },
        { id: "wordiness", label: "Wordiness", icon: FileText },
        { id: "ai_review", label: "Interview Details", icon: Star },
      ]
    : [
        { id: "eye", label: "Eye Tracking", icon: Eye },
        { id: "tempo", label: "Pace & Tempo", icon: Timer },
        { id: "filler", label: "Filler Words", icon: AudioLines },
        { id: "wordiness", label: "Wordiness", icon: FileText },
      ];

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-main animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <CircleAlert size={40} className="text-red-400" />
          <p className="text-sm font-bold text-slate-700">
            {error || "No session data found."}
          </p>
          <Link href="/progress" className="text-sm font-bold text-main underline">
            Go back to Progress
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen pb-16 font-sans text-slate-800">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Progress
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {session.name || (isInterview ? "Interview Session" : "Presentation Session")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1 flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black uppercase">
              {session.practiceType || session.type || session.practice_type || "SESSION"}
            </span>
            {sessionDate && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>{sessionDate}</span>
              </>
            )}
            {(session.totalDuration != null || session.total_duration != null) && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>{formatTime(session.totalDuration ?? session.total_duration)}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={isInterview ? "/interview/setup" : "/presentation/setup"}>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <RotateCcw size={14} />
              Practice Again
            </button>
          </Link>
        </div>
      </div>

      {/* ── Score Overview ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Overall Score */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center">
          <ScoreRing
            score={session.overallScore ?? session.overall_score ?? 0}
            size={100}
            strokeWidth={8}
            label="Overall Score"
          />
        </div>

        {/* Filler Words */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <AudioLines size={20} className="text-orange-500" />
          <span className="text-2xl font-black text-slate-800">
            {(session.fillerIncidents || session.filler_incidents || []).length}
          </span>
          <span className="text-xs font-bold text-slate-400">Total Filler Words</span>
        </div>

        {/* Distraction */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <Eye size={20} className="text-blue-500" />
          <span className="text-2xl font-black text-slate-800">
            {session.totalDistractDuration != null || session.total_distract_duration != null
              ? `${(session.totalDistractDuration ?? session.total_distract_duration).toFixed(1)}s`
              : "0s"}
          </span>
          <span className="text-xs font-bold text-slate-400">Total Distracted</span>
        </div>

        {/* WPM */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
          <Timer size={20} className="text-green-500" />
          <span className="text-2xl font-black text-slate-800">{wpm}</span>
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

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
        {/* ── Distraction / Eye Tracking Tab ── */}
        {(activeTab === "distraction" || activeTab === "eye") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Video Player */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-800 text-sm">
                  Focus & Eye Tracking Replay
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {clips.length > 0
                    ? `Clip ${activeClipIndex + 1} of ${clips.length}`
                    : "No clips available"}
                </span>
              </div>

              {clips.length === 0 ? (
                <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Film size={40} />
                    <span className="text-xs font-bold">No Video Available</span>
                    <span className="text-[10px] text-slate-300">
                      No distraction clips were recorded for this session.
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <CustomVideoPlayer
                    clip={activeClipIndex >= 0 ? clips[activeClipIndex] : null}
                    onClipEnded={() => {
                      if (activeClipIndex < clips.length - 1) {
                        setActiveClipIndex(activeClipIndex + 1);
                      }
                    }}
                  />

                  {/* Clip navigation */}
                  {clips.length > 1 && (
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <button
                        onClick={() => setActiveClipIndex(activeClipIndex - 1)}
                        disabled={activeClipIndex <= 0}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft size={12} />
                        <span className="hidden sm:inline">Previous Clip</span>
                        <span className="sm:hidden">Prev</span>
                      </button>

                      <span className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0">
                        {activeClipIndex + 1} / {clips.length}
                      </span>

                      <button
                        onClick={() => setActiveClipIndex(activeClipIndex + 1)}
                        disabled={activeClipIndex >= clips.length - 1}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="hidden sm:inline">Next Clip</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: Clips + Summary */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                    {isInterview ? "Distraction Events" : "Eye Focus Events"}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {clips.length} highlight{clips.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {clips.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                    <Film size={28} />
                    <span className="text-xs font-medium text-center">
                      No highlights to show
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[320px] lg:max-h-[480px] overflow-y-auto">
                    {clips.map((clip, i) => (
                      <ClipCard
                        key={clip.id}
                        clip={clip}
                        isActive={i === activeClipIndex}
                        onClick={() => setActiveClipIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Session Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                  Session Summary
                </h3>
                <div className="flex flex-col gap-2 text-[11px] sm:text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-bold text-slate-700">
                      {formatTime(session.totalDuration ?? session.total_duration)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Distractions</span>
                    <span className="font-bold text-slate-700">
                      {session.distractCount ?? session.distract_count ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Total Distracted</span>
                    <span className="font-bold text-slate-700">
                      {formatDuration(session.totalDistractDuration ?? session.total_distract_duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WPM / Pace & Tempo Tab ── */}
        {(activeTab === "wpm" || activeTab === "tempo") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main WPM View */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-5">
              <div>
                <h2 className="font-black text-slate-800 text-sm">Speaking Pace</h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Your average speaking speed. Ideal pace is 100–130 WPM.
                </p>
              </div>

              {wpm > 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="text-7xl font-black text-slate-800">{wpm}</div>
                  <div className="text-lg font-bold text-slate-400">WPM</div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black ${wpmColor}`}>
                    {wpmStatus}
                  </div>
                  <p className="text-sm text-slate-400 font-medium mt-2">
                    {wordCount} words spoken in {formatTime(session.totalDuration ?? session.total_duration)}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Timer size={40} />
                  <span className="text-sm font-bold">No pace data available</span>
                  <span className="text-xs">Audio analysis may not have completed.</span>
                </div>
              )}
            </div>

            {/* Right sidebar pace summary */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                  Pace Summary
                </h3>
                {wpm > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400">
                          Average Speed
                        </span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">
                          {wpm} Words / Min
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${wpmColor}`}>
                        {wpmStatus}
                      </span>
                    </div>
                    <div className="mt-1 pt-3 border-t border-slate-200 px-4">
                      <span className="text-[10px] font-bold text-slate-400">
                        Total: {wordCount} words in {formatTime(session.totalDuration ?? session.total_duration)}
                      </span>
                    </div>
                    {/* Per-question breakdown for interview */}
                    {isInterview && interviewDetails.length > 0 && (
                      <div className="mt-2 pt-3 border-t border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                          Per Question
                        </span>
                        <div className="flex flex-col gap-2">
                          {interviewDetails.map((detail, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-600">
                              Q{detail.questionNumber || detail.question_number || i + 1}
                              </span>
                              <span className="font-bold text-slate-700">
                                {detail.duration != null ? formatTime(detail.duration) : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                    <Timer size={28} />
                    <span className="text-xs font-medium">No data</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Filler Words Tab ── */}
        {activeTab === "filler" && (
          <div>
            <h2 className="font-black text-slate-800 text-sm mb-3">
              Filler Word Incidents in Transcript
            </h2>
            {fillerIncidents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle size={40} className="text-green-400" />
                <span className="text-sm font-bold text-green-600">
                  No Filler Words Detected
                </span>
                <span className="text-xs text-slate-400">
                  Great job! Your speech was clean and free of filler words.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {fillerIncidents.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Used word:{" "}
                        <span className="text-red-500 font-black">
                          &ldquo;{event.word}&rdquo;
                        </span>
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
        )}

        {/* ── Wordiness Tab ── */}
        {activeTab === "wordiness" && (
          <div>
            <h2 className="font-bold text-slate-800">
              Wordiness Analysis & Pleonasm Correction
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Simplifying complex/redundant phrases improves message clarity
              and increases audience engagement.
            </p>
            {wordinessItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 mt-4">
                <CheckCircle size={40} className="text-green-400" />
                <span className="text-sm font-bold text-green-600">
                  No Wordiness Issues Detected
                </span>
                <span className="text-xs text-slate-400">
                  Your speech was concise and efficient — no redundant phrases found.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                {wordinessItems.map((item, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Wordy Phrase
                          </span>
                          <span className="text-sm font-extrabold text-red-500 line-through bg-red-50/50 border border-red-100 rounded px-2.5 py-1 mt-1">
                            {item.original}
                          </span>
                        </div>
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
                        {item.issueType || "Pleonasm"}
                      </span>
                    </div>
                    {item.context && (
                      <div className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                        <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">
                          Transcript Context
                        </span>
                        <span>
                          {item.context.split("*" + item.original + "*").map((part, idx, arr) => (
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
                    )}
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      💡 <strong>Coach Tip:</strong> {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Interview Details Tab (Interview only) ── */}
        {activeTab === "ai_review" && (
          <div>
            <h3 className="font-bold text-lg mb-4">Interview Details</h3>
            <AIReviewCarousel interviewDetails={interviewDetails} />
          </div>
        )}
      </div>
    </div>
  );
}
