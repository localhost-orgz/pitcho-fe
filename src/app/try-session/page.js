"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Clock,
  Activity,
  ChevronLeft,
  Volume2,
  VolumeX,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
} from "lucide-react";

export default function TrySessionPage() {
  const videoRef = useRef(null);
  const hasCoughedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loopIntro, setLoopIntro] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Play cough.mp3 sound (with fallback)
  const playCoughAudio = () => {
    const audio = new Audio("/cough.mp3");
    audio.play().catch((err) => {
      console.warn("Could not play /cough.mp3, trying /cough_sfx.mp3:", err);
      const fallbackAudio = new Audio("/cough_sfx.mp3");
      fallbackAudio.play().catch((err2) => {
        console.error("Could not play any cough audio file:", err2);
      });
    });
  };

  // Track video progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // If loopIntro is active and video time hits or passes 7 seconds
    if (loopIntro && time >= 7) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      hasCoughedRef.current = false;
      return;
    }

    // Play cough sound exactly when hitting the 8th second on timeline
    if (time < 8) {
      hasCoughedRef.current = false;
    } else if (time >= 8 && !hasCoughedRef.current) {
      hasCoughedRef.current = true;
      playCoughAudio();
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Loop Intro Toggle Change
  const handleLoopChange = (checked) => {
    setLoopIntro(checked);
    if (checked && videoRef.current) {
      // If loop is enabled and we are past 7s, immediately jump back to 0s
      if (videoRef.current.currentTime >= 7) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        triggerToast("Looped back to 0s!");
      } else {
        triggerToast("0s-7s Loop Enabled");
      }
    } else {
      triggerToast("Loop Disabled");
    }
  };

  // 3. **Jump to Cough Effect**:
  // - A button to skip the playhead to the 8.0s mark (the coughing distraction cue).
  // - **Polished UX Transition**: Automatically disables the 0s-7s loop when clicked, allowing the user to experience the cough effect and subsequent video segments seamlessly without being immediately snapped back to the beginning.
  // - **Timeline Sync**: The cough sound triggers automatically via the video's onTimeUpdate when the playhead crosses 8.0s.
  const jumpToCough = () => {
    if (!videoRef.current) return;

    // Critical UX adjustment: if 0s-7s loop is active, disable it so they can see the 8s+ video
    if (loopIntro) {
      setLoopIntro(false);
      triggerToast("Disabled Loop & Jumped to Cough Effect!");
    } else {
      triggerToast("Jumped to Cough Effect (8s)");
    }

    // Force trigger reset so it plays immediately when currentTime changes to 8
    hasCoughedRef.current = false;

    videoRef.current.currentTime = 8;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Simple toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle custom seek
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Helper formatting for seconds
  const formatSec = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get active session segment details
  const getSessionSegmentDetails = () => {
    if (currentTime >= 8) {
      return {
        label: "Coughing Distraction Active",
        colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        desc: "The audience is exhibiting coughing distractions to test speaker focus.",
      };
    }
    if (currentTime >= 7) {
      return {
        label: "Transition Phase",
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        desc: "Moving from normal introduction to target distraction phase.",
      };
    }
    return {
      label: "Normal Presentation Pitch",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "Ideal presentation environment. Speaker has full audience focus.",
    };
  };

  const segment = getSessionSegmentDetails();

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-10 py-4 px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
            Back Home
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" />
              Try Session Sandbox
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive playground to simulate distraction loops and triggers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
            Simulation Active
          </span>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* Left Side: Video Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative w-full aspect-video bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-3 shadow-2xl flex flex-col overflow-hidden group">
            {/* The Video Element */}
            <div className="relative flex-1 bg-black rounded-2xl overflow-hidden border border-slate-800/80 aspect-video shadow-inner">
              <video
                ref={videoRef}
                src="/Pitcho.mp4"
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                playsInline
              />

              {/* Central Play Button Overlay (visible when paused) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all hover:bg-slate-950/30"
                >
                  <div className="w-16 h-16 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-lg border border-indigo-400/30 transition-all duration-300 hover:scale-110 active:scale-95 group-hover:shadow-indigo-500/20">
                    <Play size={28} className="ml-1 fill-current text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Control Bar */}
            <div className="mt-3 px-2 flex flex-col gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              {/* Progress Slider */}
              <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">
                  {formatSec(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 10}
                  step={0.05}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 rounded-lg appearance-none bg-slate-800 accent-indigo-500 cursor-pointer outline-none focus:accent-indigo-400"
                />
                <span className="text-[10px] font-mono text-slate-400 min-w-[32px]">
                  {formatSec(duration)}
                </span>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        setCurrentTime(0);
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all active:scale-95 cursor-pointer"
                    title="Restart Video"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all active:scale-95 cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>

                {/* Status Indicator inside controls */}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Source: Pitcho.mp4
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Segment Helper Guide */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-slate-400 shrink-0 w-5 h-5 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Timeline Markers
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                • <strong className="text-slate-300">0s - 7s:</strong> Intro
                presentation phase. Loop feature confines playback strictly here
                to repeat basic intro gestures. <br />•{" "}
                <strong className="text-slate-300">8s+:</strong> Distraction
                phase. Contains the simulated coughing gesture triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Control Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Simulation Controls
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure loop behaviors and trigger audio/video distraction
                cues.
              </p>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Loop Toggle Checkbox */}
            <div className="flex flex-col gap-2 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors ${loopIntro ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`}
                    />
                    Loop Intro (0s - 7s)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Repeat starting segment infinitely
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={loopIntro}
                    onChange={(e) => handleLoopChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mt-1 border-t border-slate-800/50 pt-2">
                Yes/No choice. When turned{" "}
                <strong className="text-indigo-400">Yes</strong>, the video
                playhead will reset back to 0.0s the instant it hits 7.0s.
              </p>
            </div>

            {/* Jump To Cough Trigger */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Distraction Triggers
              </span>

              <button
                onClick={jumpToCough}
                className="group relative w-full overflow-hidden px-4 py-4 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] border border-rose-500/20 text-rose-300 font-black rounded-2xl flex flex-col items-start gap-1.5 transition-all duration-100 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.02)] hover:shadow-[0_0_20px_rgba(244,63,94,0.08)]"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-black tracking-wide flex items-center gap-2">
                    <Activity className="text-rose-400 group-hover:animate-bounce w-4 h-4" />
                    Jump to Cough Effect
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-200 border border-rose-500/30 rounded-md">
                    Skip to 8.0s
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium text-left leading-normal">
                  Sets video to the 8th second to trigger coughing animation
                  immediately. (Disables 0-7s loop).
                </span>

                {/* Visual hover cue */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500/50 transition-all group-hover:w-1.5" />
              </button>
            </div>
          </div>

          {/* Interactive Live Status */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp size={12} /> Live Session Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  Loop Mode
                </span>
                <span
                  className={`text-xs font-black ${loopIntro ? "text-indigo-400" : "text-slate-400"}`}
                >
                  {loopIntro ? "0s-7s Loop (Active)" : "Standard Playback"}
                </span>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  Speaker Playhead
                </span>
                <span className="text-xs font-black text-slate-300 font-mono">
                  {currentTime.toFixed(2)}s /{" "}
                  {duration ? `${duration.toFixed(1)}s` : "Loading..."}
                </span>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${segment.colorClass} transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider">
                  {segment.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                {segment.desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl transition-all duration-300 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="p-1 bg-indigo-500/10 rounded-lg">
          <CheckCircle size={14} className="text-indigo-400" />
        </div>
        <span className="text-xs font-bold">{toastMessage}</span>
      </div>
    </div>
  );
}
