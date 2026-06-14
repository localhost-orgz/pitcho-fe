"use client";

// src/app/presentation/result/page.js

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Pause,
  CheckCircle,
  XCircle,
  Zap,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Film,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { getSessionVideo, clearSessionVideo, getSessionClips } from "@/utils/videoStorage";
import { calculateSessionScore } from "@/utils/scoring";
import { uploadClip, saveSession } from "@/lib/api";

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

// ── Session data loading hook ──────────────────────────────
function useSessionData() {
  const [sessionData, setSessionData] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const blobUrlsRef = useRef([]); // track all blob URLs for cleanup

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Skip redirect when tour is active (user is viewing, not reviewing real data)
        const tourCompleted = localStorage.getItem("pitcho_tour_completed");
        // Load metadata from localStorage
        const raw = localStorage.getItem("pitcho_session_data");
        if (!raw && tourCompleted === "true") {
          setLoading(false);
          window.location.replace("/presentation/setup");
          return;
        }
        const data = JSON.parse(raw);
        if (cancelled) return;
        setSessionData(data);

        // Load speech analysis data from localStorage
        try {
          const analysisRaw = localStorage.getItem("pitcho_speech_analysis");
          if (analysisRaw) {
            const parsed = JSON.parse(analysisRaw);
            if (parsed && parsed.analysis) {
              setAnalysisData(parsed);
            }
          }
        } catch (e) {
          console.warn("Failed to parse speech analysis data:", e);
        }

        // Skip video/clip loading from IndexedDB when the tour is in progress.
        // During the tour no real recording happens, so IndexedDB would only
        // contain a stale video from the user's previous real session.
        const tourInProgress = tourCompleted !== "true";

        if (!tourInProgress) {
          // Load real clips from IndexedDB (extracted at session end)
          let realClipsLoaded = false;
          try {
            const storedClips = await getSessionClips();
            if (!cancelled && storedClips.length > 0) {
              const events = data.lookAwayEvents || [];
              const realClips = storedClips.map((storedClip, i) => {
                const blobUrl = URL.createObjectURL(storedClip.blob);
                blobUrlsRef.current.push(blobUrl);
                const matchingEvent = events.find((e) => e.id === storedClip.id) || {};
                return {
                  id: storedClip.id || `clip-${i}`,
                  timestamp: storedClip.timestamp || matchingEvent.timestamp || 0,
                  type: storedClip.type || matchingEvent.type || "Unknown",
                  duration: storedClip.duration || matchingEvent.duration || 0,
                  clipDuration: 6,
                  clipUrl: blobUrl, // real standalone clip video
                  thumbnail: null,
                  isRealClip: true,
                };
              });
              if (!cancelled) {
                setClips(realClips);
                realClipsLoaded = true;
              }
            }
          } catch (e) {
            console.warn("Failed to load clips from IndexedDB, falling back to full video:", e);
          }

          // Fallback: if no real clips loaded, use full video + timeline windowing
          if (!cancelled && !realClipsLoaded) {
            const blob = await getSessionVideo();
            if (blob) {
              setVideoBlob(blob);
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
                  type: evt.type || "Unknown",
                  duration: evt.duration || 0,
                  clipStart,
                  clipEnd,
                  clipDuration: clipEnd - clipStart,
                  clipUrl: url,
                  thumbnail: null,
                  isRealClip: false,
                };
              });
              if (!cancelled) setClips(extracted);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load session data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      // Don't revoke URLs here — the player may still need them
    };
  }, []);

  // Cleanup on unmount — revoke all blob URLs
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  return { sessionData, videoBlob, videoUrl, clips, loading, analysisData };
}

// ── Format seconds as mm:ss ────────────────────────────────
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

// ── Score ring SVG ──────────────────────────────────────────
// ── Score-to-color helper ──────────────────────────────────
function scoreToColor(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 120; // 0→red, 60→yellow, 120→green
  return `hsl(${hue}, 85%, 50%)`;
}

function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const hue = (Math.max(0, Math.min(100, score)) / 100) * 120;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130" className="shrink-0">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue}, 85%, 55%)`} />
          <stop offset="100%" stopColor={scoreToColor(score)} />
        </linearGradient>
      </defs>
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
        {metric.extra && (
          <span className="text-[10px] font-semibold text-slate-400">
            {metric.extra}
          </span>
        )}
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

// ── Custom Video Player (handles both real clips and timeline-windowed) ──
function CustomVideoPlayer({ clip, onClipEnded }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const isRealClip = clip?.isRealClip === true;
  const clipDuration = clip?.clipDuration || 0;
  const clipStart = clip?.clipStart || 0;
  const clipEnd = clip?.clipEnd || 0;

  // When clip changes: for real clips play from 0; for fallback seek to clipStart
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

  // Sync currentTime from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (seeking) return;
      if (isRealClip) {
        // Real clip: track time from 0, stop at end
        setCurrentTime(video.currentTime);
        if (video.currentTime >= video.duration && video.duration > 0) {
          video.pause();
          setPlaying(false);
          setCurrentTime(video.duration);
          if (onClipEnded) onClipEnded();
        }
      } else {
        // Fallback: windowed playback on full video
        const localTime = video.currentTime - clipStart;
        setCurrentTime(Math.max(0, Math.min(localTime, clipDuration)));
        if (video.currentTime >= clipEnd) {
          video.pause();
          setPlaying(false);
          setCurrentTime(clipDuration);
          if (onClipEnded) onClipEnded();
        }
      }
    };

    const onLoaded = () => {
      if (isRealClip) {
        setDuration(video.duration || clipDuration);
      } else {
        setDuration(clipDuration);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [clipStart, clipEnd, clipDuration, seeking, onClipEnded, isRealClip]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !clip) return;
    if (video.paused || video.ended) {
      if (isRealClip) {
        // Real clip: rewind to start if ended
        if (video.ended || video.currentTime >= video.duration - 0.1) {
          video.currentTime = 0;
          setCurrentTime(0);
        }
      } else {
        // Fallback: rewind to clip start
        if (video.currentTime >= clipEnd - 0.1) {
          video.currentTime = clipStart;
          setCurrentTime(0);
        }
      }
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [clip, clipStart, clipEnd, isRealClip]);

  const handleSeek = useCallback(
    (e) => {
      const video = videoRef.current;
      const bar = progressRef.current;
      if (!video || !bar || !clip) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      if (isRealClip) {
        const dur = video.duration || clipDuration || 6;
        video.currentTime = Math.min(pct * dur, dur - 0.1);
        setCurrentTime(pct * dur);
      } else {
        const seekTime = clipStart + pct * clipDuration;
        video.currentTime = Math.min(seekTime, clipEnd - 0.1);
        setCurrentTime(pct * clipDuration);
      }
    },
    [clip, clipStart, clipDuration, clipEnd, isRealClip],
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

  const progressPct = clipDuration > 0 ? (currentTime / clipDuration) * 100 : 0;

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

  return (
    <div
      className="rounded-xl overflow-hidden bg-slate-900 relative aspect-video group cursor-pointer"
      onClick={togglePlay}
    >
      {/* Hidden full video element */}
      <video
        ref={videoRef}
        src={clip.clipUrl}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        playsInline
        preload="auto"
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
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="hover:text-white/70 transition-colors"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {/* Time display */}
          <span className="text-[10px] font-mono font-bold tabular-nums">
            {formatTime(currentTime)} / {formatTime(clipDuration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="hover:text-white/70 transition-colors"
            >
              {muted || volume === 0 ? (
                <VolumeX size={14} />
              ) : (
                <Volume2 size={14} />
              )}
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
          <button
            onClick={toggleFullscreen}
            className="hover:text-white/70 transition-colors"
          >
            <Maximize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Clip card (sidebar) ─────────────────────────────────────
function ClipCard({ clip, isActive, onClick, thumbnailUrl }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isActive
          ? "border-main bg-blue-50/50 shadow-sm"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      {/* Thumbnail placeholder */}
      <div className="w-16 aspect-video shrink-0 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Film size={14} className="text-slate-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-black text-slate-400">
            {formatTime(clip.timestamp)}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              clip.type.includes("Eye") || clip.type.includes("Head")
                ? "bg-blue-50 text-blue-600"
                : clip.type.includes("Face out")
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

      {/* Play button */}
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

// ── Enhanced Pace Chart Component ──────────────────────────
// ── Main Page ───────────────────────────────────────────────
export default function PresentationResultPage() {
  const { sessionData, videoBlob, videoUrl, clips, loading, analysisData } =
    useSessionData();
  const [activeClipIndex, setActiveClipIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("eye"); // 'eye' | 'tempo' | 'filler' | 'wordiness'

  // ── Upload clips and save session to backend ───────────────
  const hasPostedRef = useRef(false);

  useEffect(() => {
    if (loading || !sessionData || hasPostedRef.current) return;
    hasPostedRef.current = true;

    async function uploadAndSave() {
      try {
        // Load raw clips from IndexedDB (with blobs for upload)
        const storedClips = await getSessionClips();
        const distractionClips = [];

        if (storedClips.length > 0) {
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
        }

        // Load session config from localStorage
        const storedFile = (() => {
          try {
            return JSON.parse(localStorage.getItem("pitcho_presentation_file") || "null");
          } catch {
            return null;
          }
        })();
        const storedDistraction = localStorage.getItem("pitcho_selected_distraction") || "medium";
        const storedAudience = localStorage.getItem("pitcho_selected_audience") || "classroom";
        const storedDuration = localStorage.getItem("pitcho_selected_duration") || "1";
        const storedAnalysis = (() => {
          try {
            return JSON.parse(localStorage.getItem("pitcho_speech_analysis") || "null");
          } catch {
            return null;
          }
        })();

        const documentId = storedFile?.document_id || "00000000-0000-0000-0000-000000000000";
        const name = storedFile?.name || "Untitled";
        const analysis = storedAnalysis?.analysis || {};

        const fillerIncidents =
          analysis.filler_words?.incidents?.map((item) => ({
            word: item.word,
            context_text: item.context_text,
          })) || [];

        const wordFindings =
          analysis.word_efficiency?.findings?.map((item) => ({
            issue_type: item.issue_type,
            original_phrase: item.original_phrase,
            recommended_phrase: item.recommended_phrase,
            transcript_context: item.transcript_context,
            coach_tip: item.coach_tip,
          })) || [];

        const scoreResult = calculateSessionScore(
          {
            sessionDuration: sessionData.sessionDuration || 0,
            totalWordCount: sessionData.totalWordCount || 0,
            averageWpm: sessionData.averageWpm || 0,
            totalDistractedTime: sessionData.totalDistractedTime || 0,
          },
          storedAnalysis,
        );

        const payload = {
          practice_type: "PRESENTATION",
          document_id: documentId,
          name,
          distraction_intensity:
            storedDistraction.charAt(0).toUpperCase() + storedDistraction.slice(1),
          audience_type:
            storedAudience.charAt(0).toUpperCase() + storedAudience.slice(1),
          session_length: parseInt(storedDuration, 10) || 1,
          transcript: analysis.transcript || sessionData.transcript || "",
          distract_count: sessionData.lookAwayCount || 0,
          total_distract_duration: Math.round(sessionData.totalDistractedTime || 0),
          total_duration: Math.round(sessionData.sessionDuration || 0),
          wpm: Math.round(sessionData.averageWpm || 0),
          efficiency_score: scoreResult.breakdown.efficiency,
          overall_score: scoreResult.overallScore,
          filler_incidents: fillerIncidents,
          word_findings: wordFindings,
          interview_details: [],
          distraction_clips: distractionClips,
        };

        await saveSession(payload);
      } catch (err) {
        console.warn("Failed to save presentation session to history:", err);
      }
    }

    uploadAndSave();
  }, [loading, sessionData]);

  // ── Derived analysis data ──────────────────────────────────
  const hasAnalysis = !!analysisData?.analysis;
  const fillerWordsData = analysisData?.analysis?.filler_words;
  const wordEfficiencyData = analysisData?.analysis?.word_efficiency;
  const suggestions = analysisData?.analysis?.improvement_suggestions;

  // ── Score templates by interval ──────────────────────────
  const SCORE_TEMPLATES = [
    {
      min: 90,
      title: "Outstanding! 🏆",
      message:
        "You delivered with confidence, clarity, and excellent pacing — a top-tier performance.",
    },
    {
      min: 80,
      title: "Great job! 🎉",
      message:
        "Strong delivery overall. A few small refinements will take you to the next level.",
    },
    {
      min: 70,
      title: "Good effort! 👍",
      message:
        "Solid foundation — sharpen a couple of areas and you'll shine even brighter.",
    },
    {
      min: 50,
      title: "Keep it up! 💪",
      message:
        "A promising session. With more practice, your delivery will feel smoother and more natural.",
    },
    {
      min: 0,
      title: "Just getting started! 📣",
      message:
        "Every great speaker starts somewhere. Keep practicing — you're building real skills.",
    },
  ];

  // Overall score — calculated from all available session + analysis data
  const scoreResult = calculateSessionScore(sessionData, analysisData);
  const overallScore = scoreResult.overallScore;

  const activeTemplate =
    SCORE_TEMPLATES.find((t) => overallScore >= t.min) ||
    SCORE_TEMPLATES[SCORE_TEMPLATES.length - 1];
  const scoreLabel = activeTemplate.title;
  const scoreMessage = activeTemplate.message;

  // Build dynamic metrics based on session data
  const hasSession =
    sessionData &&
    (clips.length > 0 || (sessionData.averageWpm || 0) > 0);
  const eyeMetric = hasSession
    ? {
        id: "eye",
        icon: Eye,
        label: "Eye Contact",
        value: `${sessionData.lookAwayCount} distractions`,
        subValue:
          sessionData.lookAwayCount === 0
            ? "Excellent"
            : sessionData.lookAwayCount <= 2
              ? "Good"
              : sessionData.lookAwayCount <= 5
                ? "Fair"
                : sessionData.lookAwayCount <= 9
                  ? "Poor"
                  : "Very Poor",
        subColor:
          sessionData.lookAwayCount === 0
            ? "text-green-500"
            : sessionData.lookAwayCount <= 2
              ? "text-green-500"
              : sessionData.lookAwayCount <= 5
                ? "text-amber-500"
                : sessionData.lookAwayCount <= 9
                  ? "text-orange-500"
                  : "text-red-500",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        barColor: "bg-blue-500",
        barPct: Math.max(0, 100 - sessionData.lookAwayCount * 8),
        range: "70 – 100%",
        avgPct: 50,
        avgValue: "50%",
        userPct: Math.max(10, 100 - sessionData.lookAwayCount * 8),
        extra: sessionData.totalDistractedTime
          ? `Total distracted: ${formatDuration(sessionData.totalDistractedTime)}`
          : null,
      }
    : METRICS[0];

  // Build dynamic pace metric from session speech data
  const hasSpeechData = (sessionData?.averageWpm || 0) > 0;
  const paceMetric = hasSpeechData
    ? {
        id: "pace",
        icon: Timer,
        label: "Speaking Pace",
        value: `${sessionData.averageWpm} wpm`,
        subValue:
          sessionData.averageWpm === 0
            ? "No speech detected"
            : sessionData.averageWpm > 150
              ? "Too Fast"
              : sessionData.averageWpm >= 130
                ? "Slightly Fast"
                : sessionData.averageWpm >= 100
                  ? "Good"
                  : "Too Slow",
        subColor:
          sessionData.averageWpm === 0
            ? "text-slate-400"
            : sessionData.averageWpm > 150
              ? "text-red-500"
              : sessionData.averageWpm >= 130
                ? "text-orange-500"
                : sessionData.averageWpm >= 100
                  ? "text-green-500"
                  : "text-blue-500",
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
        barColor:
          sessionData.averageWpm > 150
            ? "bg-red-500"
            : sessionData.averageWpm >= 130
              ? "bg-orange-500"
              : sessionData.averageWpm >= 100
                ? "bg-green-500"
                : "bg-blue-500",
        barPct: Math.min(100, Math.round((sessionData.averageWpm / 150) * 70)),
        range: "100 – 150 wpm",
        avgPct: 64,
        avgValue: "117 wpm",
        userPct: Math.min(100, Math.round((sessionData.averageWpm / 150) * 70)),
        extra: sessionData.totalWordCount
          ? `${sessionData.totalWordCount} words total`
          : null,
      }
    : METRICS[2];

  // Build dynamic filler metric from analysis data
  const fillerMetric =
    hasAnalysis && fillerWordsData
      ? {
          ...METRICS[1],
          value: `${fillerWordsData.total_filler_count} filler word${fillerWordsData.total_filler_count !== 1 ? "s" : ""}`,
          subValue:
            fillerWordsData.total_filler_count === 0
              ? "Excellent"
              : fillerWordsData.total_filler_count <= 2
                ? "Good"
                : fillerWordsData.total_filler_count <= 5
                  ? "Needs Work"
                  : "Poor",
          subColor:
            fillerWordsData.total_filler_count === 0
              ? "text-green-500"
              : fillerWordsData.total_filler_count <= 2
                ? "text-green-500"
                : fillerWordsData.total_filler_count <= 5
                  ? "text-orange-500"
                  : "text-red-500",
          barPct: Math.max(5, 100 - fillerWordsData.total_filler_count * 15),
          userPct: Math.max(5, 100 - fillerWordsData.total_filler_count * 15),
        }
      : METRICS[1];

  const dynamicMetrics = [eyeMetric, fillerMetric, paceMetric];

  // ── Dynamic filler/wordiness data for tabs ───────────────
  // Helper: wrap word occurrences in text with *...* for highlighting
  function makeHighlightPhrase(text, word) {
    if (!word || !text) return text;
    var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var pattern = new RegExp("\\b(" + escaped + ")\\b", "gi");
    return text.replace(pattern, "*$1*");
  }

  var dynamicFillerEvents = null;
  var dynamicWordinessItems = null;
  if (hasAnalysis) {
    if (fillerWordsData && fillerWordsData.incidents) {
      dynamicFillerEvents = fillerWordsData.incidents.map(function (inc) {
        return {
          word: inc.word.toLowerCase(),
          phrase: makeHighlightPhrase(inc.context_text, inc.word),
        };
      });
    }
    if (wordEfficiencyData && wordEfficiencyData.findings) {
      dynamicWordinessItems = wordEfficiencyData.findings.map(function (f) {
        return {
          original: f.original_phrase,
          improved: f.recommended_phrase,
          context: makeHighlightPhrase(f.transcript_context, f.original_phrase),
          explanation: f.coach_tip,
          issueType: f.issue_type,
        };
      });
    }
  }

  // Items to render per tab (dynamic or static fallback)
  var fillerEvents =
    hasAnalysis && dynamicFillerEvents ? dynamicFillerEvents : FILLER_EVENTS;
  var fillerHasData = hasAnalysis;
  var fillerIsEmpty =
    hasAnalysis && dynamicFillerEvents && dynamicFillerEvents.length === 0;
  var wordinessItems =
    hasAnalysis && dynamicWordinessItems
      ? dynamicWordinessItems
      : WORDINESS_ITEMS;
  var wordinessHasData = hasAnalysis;
  var wordinessIsEmpty =
    hasAnalysis && dynamicWordinessItems && dynamicWordinessItems.length === 0;

  return (
    <div className="w-full min-h-screen">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Post-Session Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1 flex items-center gap-2 flex-wrap">
            <span>Presentation Practice</span>
            {hasSession && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>{formatTime(sessionData.sessionDuration)}</span>
              </>
            )}
            {!hasSession && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>May 27, 2025</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>10:24 AM</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span>12m 45s</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Row 1: Score + Metric cards ──────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Overall score card */}
        <div
          data-tour="score-rings"
          className="bg-white rounded-2xl border-bold px-5 py-5 flex flex-col sm:flex-row items-center sm:items-center gap-5 shrink-0 w-full lg:w-[380px] text-center sm:text-left"
        >
          <ScoreRing score={overallScore} />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Score
            </p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              {scoreLabel}
            </p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {scoreMessage}
            </p>
          </div>
        </div>

        {/* Metric top cards grid */}
        <div className="flex-1 grid grid-cols-1 xs:grid-cols-3 gap-3">
          {dynamicMetrics.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>

      {/* ── Improvement Suggestions (from speech analysis) ────── */}
      {hasAnalysis && suggestions && suggestions.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border-bold p-5">
          <h3 className="font-black text-slate-800 text-sm mb-3">
            Improvement Suggestions
          </h3>
          <div className="flex flex-col gap-3">
            {suggestions.map(function (s, i) {
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl"
                >
                  <Lightbulb
                    size={16}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      {s.focus_area}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {s.concrete_action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div
        data-tour="metrics-tabs"
        className="flex border-b-2 border-slate-200 gap-1 mb-6 overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0"
      >
        <button
          onClick={() => setActiveTab("eye")}
          className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "eye"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Eye Tracking
        </button>
        <button
          onClick={() => setActiveTab("tempo")}
          className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "tempo"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Pace & Tempo
        </button>
        <button
          onClick={() => setActiveTab("filler")}
          className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "filler"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Filler Words
        </button>
        <button
          onClick={() => setActiveTab("wordiness")}
          className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-4 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "wordiness"
              ? "border-main text-main"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Wordiness
        </button>
      </div>

      {/* ── Tab Contents ──────────────────────────────────────── */}
      {/* ── Tab 1: Eye Tracking ── */}
      {activeTab === "eye" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Custom Media Player */}
          <div className="lg:col-span-8 bg-white rounded-2xl border-bold p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-sm">
                Focus & Eye Tracking Replay
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {hasSession
                  ? `Clip ${activeClipIndex + 1} of ${clips.length}`
                  : "No session data available"}
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl bg-slate-100 aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-main rounded-full animate-spin" />
                  <span className="text-xs font-bold">
                    Loading session video...
                  </span>
                </div>
              </div>
            ) : !hasSession ? (
              <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Film size={40} />
                  <span className="text-xs font-bold">
                    No session recording available
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Complete a presentation session to see your replay
                  </span>
                </div>
              </div>
            ) : (
              <>
                <CustomVideoPlayer
                  clip={activeClipIndex >= 0 ? clips[activeClipIndex] : null}
                  onClipEnded={() => {
                    // Auto-advance to next clip
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

          {/* Right: Eye Focus Events / Highlights */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border-bold p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                  Eye Focus Events
                </h3>
                {hasSession && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {clips.length} highlight{clips.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {!hasSession ? (
                <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                  <Film size={28} />
                  <span className="text-xs font-medium text-center">
                    No highlights to show
                  </span>
                  <span className="text-[10px] text-slate-300 text-center">
                    Distraction events from your session will appear here
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[320px] lg:max-h-[480px] overflow-y-auto">
                  {clips.map((clip, i) => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      isActive={i === activeClipIndex}
                      thumbnailUrl={clip.thumbnail}
                      onClick={() => setActiveClipIndex(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Summary stats */}
            {hasSession && (
              <div className="bg-white rounded-2xl border-bold p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                  Session Summary
                </h3>
                <div className="flex flex-col gap-2 text-[11px] sm:text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-bold text-slate-700">
                      {formatTime(sessionData.sessionDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Distractions
                    </span>
                    <span className="font-bold text-slate-700">
                      {sessionData.lookAwayCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Total Distracted
                    </span>
                    <span className="font-bold text-slate-700">
                      {formatDuration(sessionData.totalDistractedTime)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Pace & Tempo ── */}
      {activeTab === "tempo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* Main Tempo View */}
          <div className="lg:col-span-8 bg-white rounded-2xl border-bold p-4 sm:p-5 flex flex-col gap-5">
            <div>
              <h2 className="font-black text-slate-800 text-sm">
                Speaking Pace
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Your average speaking speed. Ideal for presentations is 100–130 WPM.
              </p>
            </div>

            {hasSpeechData ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-7xl font-black text-slate-800">
                  {sessionData.averageWpm}
                </div>
                <div className="text-lg font-bold text-slate-400">WPM</div>
                <div
                  className={`px-4 py-1.5 rounded-full text-sm font-black ${
                    sessionData.averageWpm > 150
                      ? "bg-red-100 text-red-600"
                      : sessionData.averageWpm >= 130
                        ? "bg-orange-100 text-orange-600"
                        : sessionData.averageWpm >= 100
                          ? "bg-green-100 text-green-600"
                          : sessionData.averageWpm > 0
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {sessionData.averageWpm > 150
                    ? "Too Fast"
                    : sessionData.averageWpm >= 130
                      ? "Slightly Fast"
                      : sessionData.averageWpm >= 100
                        ? "Ideal Pace"
                        : sessionData.averageWpm > 0
                          ? "Too Slow"
                          : "No Data"}
                </div>
                <p className="text-sm text-slate-400 font-medium mt-2">
                  {sessionData.totalWordCount || 0} words spoken in{" "}
                  {formatTime(sessionData.sessionDuration)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Timer size={40} />
                <span className="text-sm font-bold">No pace data available</span>
                <span className="text-xs">
                  Audio analysis may not have completed.
                </span>
              </div>
            )}
          </div>

          {/* Right sidebar pace summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border-bold p-4 sm:p-5 flex flex-col gap-4">
              <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                Pace Summary
              </h3>
              {hasSpeechData ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400">
                        Average Speed
                      </span>
                      <span className="text-xs font-bold text-slate-700 mt-0.5">
                        {sessionData.averageWpm} Words / Min
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                        sessionData.averageWpm > 150
                          ? "bg-red-50 text-red-500"
                          : sessionData.averageWpm >= 130
                            ? "bg-orange-50 text-orange-500"
                            : sessionData.averageWpm >= 100
                              ? "bg-green-50 text-green-600"
                              : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {sessionData.averageWpm > 150
                        ? "Too Fast"
                        : sessionData.averageWpm >= 130
                          ? "Slightly Fast"
                          : sessionData.averageWpm >= 100
                            ? "Ideal Pace"
                            : "Too Slow"}
                    </span>
                  </div>
                  <div className="mt-1 pt-3 border-t border-slate-200 px-4">
                    <span className="text-[10px] font-bold text-slate-400">
                      Total: {sessionData.totalWordCount} words in{" "}
                      {formatTime(sessionData.sessionDuration)}
                    </span>
                  </div>
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

      {/* ── Tab 3: Filler Words ── */}
      {activeTab === "filler" && (
        <div className="grid grid-cols-12 gap-4 animate-fade-in">
          <div className="col-span-12 bg-white rounded-2xl border-bold p-5 flex flex-col gap-5">
            <div>
              <h2 className="font-black text-slate-800 text-sm mb-3">
                Filler Word Incidents in Transcript
              </h2>
              {!fillerHasData && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <AudioLines size={40} className="text-slate-300" />
                  <span className="text-sm font-bold text-slate-400">
                    No Filler Word Analysis Available
                  </span>
                  <span className="text-xs text-slate-300">
                    Filler word analysis requires microphone access during your
                    session.
                  </span>
                </div>
              )}
              {fillerIsEmpty && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <CheckCircle size={40} className="text-green-400" />
                  <span className="text-sm font-bold text-green-600">
                    No Filler Words Detected
                  </span>
                  <span className="text-xs text-slate-400">
                    Great job! Your speech was clean and free of filler words.
                  </span>
                </div>
              )}
              {fillerHasData && !fillerIsEmpty && (
                <div className="flex flex-col gap-2">
                  {fillerEvents.map((event, i) => (
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
                        <p className="text-xs text-slate-700 mt-1 italic font-medium leading-relaxed">
                          {event.phrase
                            .split("*" + event.word + "*")
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Wordiness ── */}
      {activeTab === "wordiness" && (
        <div className="grid grid-cols-12 gap-4 animate-fade-in">
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

            {!wordinessHasData && (
              <div className="flex flex-col items-center gap-3 py-12">
                <FileText size={40} className="text-slate-300" />
                <span className="text-sm font-bold text-slate-400">
                  No Wordiness Analysis Available
                </span>
                <span className="text-xs text-slate-300">
                  Wordiness analysis requires microphone access during your
                  session.
                </span>
              </div>
            )}
            {wordinessIsEmpty && (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle size={40} className="text-green-400" />
                <span className="text-sm font-bold text-green-600">
                  No Wordiness Issues Detected
                </span>
                <span className="text-xs text-slate-400">
                  Your speech was concise and efficient — no redundant phrases
                  found.
                </span>
              </div>
            )}
            {wordinessHasData && !wordinessIsEmpty && (
              <div className="flex flex-col gap-4">
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
                    <div className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block mb-1">
                        Transcript Context
                      </span>
                      <span>
                        {item.context
                          .split("*" + item.original + "*")
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
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      💡 <strong>Coach Tip:</strong> {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
