"use client";

// src/app/presentation/session/page.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Mic,
  Monitor,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Pause,
  X,
  Eye,
  AudioLines,
  Timer,
  Lightbulb,
  CircleAlert,
  CheckCircle,
  AlertTriangle,
  Activity,
  MonitorX,
  ScanFace,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { useFaceTracker } from "@/hooks/useFaceTracker";

// ── Key points (iterable) ──────────────────────────────────
const KEY_POINTS = [
  "Start with a hook about how work culture has changed.",
  "Explain the benefits of remote work for employees.",
  "Discuss challenges faced by remote teams.",
  "Share strategies to overcome those challenges.",
  "End with your takeaways and a strong closing.",
];

// ── Equipment Status Bar ───────────────────────────────────
function EquipmentBar({ internetSpeed, isCameraOn, isMicOn }) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 bg-white border-2 border-slate-200/80 rounded-2xl shrink-0 shadow-xs">
      {/* Camera */}
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 ${isCameraOn ? "bg-green-500/10" : "bg-red-500/10"} rounded-full`}
        >
          <Camera
            size={14}
            className={isCameraOn ? "text-green-600" : "text-red-500"}
          />
        </div>
        <span className="text-xs font-bold text-slate-700">Camera</span>
        <span
          className={`text-xs font-semibold flex items-center gap-1 ${isCameraOn ? "text-green-600" : "text-red-500"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${isCameraOn ? "bg-green-500" : "bg-red-500"}`}
          />
          {isCameraOn ? "On" : "Off"}
        </span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Mic */}
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 ${isMicOn ? "bg-green-500/10" : "bg-red-500/10"} rounded-full`}
        >
          <Mic
            size={14}
            className={isMicOn ? "text-green-600" : "text-red-500"}
          />
        </div>
        <span className="text-xs font-bold text-slate-700">Mic</span>
        <span
          className={`text-xs font-semibold flex items-center gap-1 ${isMicOn ? "text-green-600" : "text-red-500"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${isMicOn ? "bg-green-500" : "bg-red-500"}`}
          />
          {isMicOn ? "On" : "Off"}
        </span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Internet */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-main/10 rounded-full">
          <Wifi size={14} className="text-main" />
        </div>
        <span className="text-xs font-bold text-slate-700">Internet</span>
        <span className="text-xs font-semibold text-main">
          {internetSpeed} Mbps
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}

// ── Simulated internet speed hook ─────────────────────────
function useInternetSpeed() {
  const [speed, setSpeed] = useState("48.2");
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((prev) => {
        const base = parseFloat(prev);
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(10, base + delta).toFixed(1);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return speed;
}

// ── Session Timer ──────────────────────────────────────────
function useSessionTimer(totalSeconds, running) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 1, totalSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, running]);
  return elapsed;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Eye Tracker Calibration Overlay ────────────────────────
function CalibrationOverlay({ tracker, onCalibrated }) {
  const {
    isLoading,
    error,
    status,
    isFaceDetected,
    detectionMode,
    startCalibration,
    switchDetectionMode,
  } = tracker;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "calibrating") {
      setProgress(0);
      const iv = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(iv);
            return 100;
          }
          return p + 2.5;
        });
      }, 40);
      return () => clearInterval(iv);
    } else {
      setProgress(0);
    }
  }, [status]);

  // Once calibration is complete the hook switches status → "tracking"
  useEffect(() => {
    if (status === "tracking") {
      onCalibrated();
    }
  }, [status, onCalibrated]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
          <ScanFace size={26} className="text-main" />
        </div>

        <div>
          <h3 className="font-black text-slate-800 text-base">
            {status === "calibrating" ? "Calibrating…" : "Eye Tracking Setup"}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            {status === "calibrating"
              ? "Keep your eyes focused directly at the screen."
              : isFaceDetected
                ? "Face detected! Click Calibrate to lock your baseline."
                : isLoading
                  ? "Loading face model…"
                  : "Position your face in the camera and look straight ahead."}
          </p>
        </div>

        {/* Calibration progress bar */}
        {status === "calibrating" && (
          <div className="w-full">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-main transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Status indicator */}
        <div
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${
            isFaceDetected && status !== "calibrating"
              ? "bg-green-50 text-green-600"
              : status === "calibrating"
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isFaceDetected && status !== "calibrating"
                ? "bg-green-500"
                : status === "calibrating"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-slate-300 animate-pulse"
            }`}
          />
          {isLoading
            ? "Loading model…"
            : isFaceDetected && status !== "calibrating"
              ? "Face Detected"
              : status === "calibrating"
                ? "Calibrating…"
                : "Searching for face…"}
        </div>

        {/* Error */}
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        {/* Calibrate button */}
        {status !== "calibrating" && (
          <button
            onClick={startCalibration}
            disabled={!isFaceDetected || isLoading}
            className={`w-full py-3 rounded-xl text-sm font-black transition-all border-b-4 ${
              isFaceDetected && !isLoading
                ? "bg-main text-white border-blue-700 hover:border-b-2 hover:translate-y-[2px] cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            <Crosshair size={14} className="inline mr-1.5 -mt-0.5" />
            Calibrate Eyes
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function PresentationSessionPage() {
  const internetSpeed = useInternetSpeed();
  const SESSION_TOTAL = 600; // 10 minutes

  const [sessionRunning, setSessionRunning] = useState(false);
  const elapsed = useSessionTimer(SESSION_TOTAL, sessionRunning);

  const [activeKeyPoint, setActiveKeyPoint] = useState(0);
  const [activeTab, setActiveTab] = useState("cuecard"); // 'cuecard' | 'notes'

  // ── Eye Tracker integration ─────────────────────────────
  const tracker = useFaceTracker();
  const {
    status: trackerStatus,
    isFaceDetected,
    lookAwayCount,
    loadModel,
    startCamera,
    runDetectionLoop,
    stopTracker,
    switchDetectionMode,
  } = tracker;

  const facecamRef = useRef(null); // <video> in the bottom-left slot
  const [showCalibration, setShowCalibration] = useState(false);
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Start camera + load model when the component mounts
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Use eye mode by default for this page
        switchDetectionMode("eye");

        // Load MediaPipe model
        await loadModel();
        if (cancelled) return;

        // Start camera and attach to facecam video element
        if (facecamRef.current) {
          await startCamera(facecamRef.current);
          if (cancelled) return;
          setCameraReady(true);
          // Show the calibration prompt after camera is ready
          setShowCalibration(true);
          // Start alignment loop (won't count look-aways yet)
          runDetectionLoop(facecamRef.current, "alignment");
        }
      } catch (err) {
        console.error("Eye tracker init failed:", err);
      }
    }

    init();
    return () => {
      cancelled = true;
      stopTracker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called once calibration finishes
  const handleCalibrated = useCallback(() => {
    setShowCalibration(false);
    setEyeTrackingActive(true);
    setSessionRunning(true);
    // Switch detection loop to tracking mode
    if (facecamRef.current) {
      runDetectionLoop(facecamRef.current, "tracking");
    }
  }, [runDetectionLoop]);

  // Determine eye-contact status based on cumulative look-away count
  // Scale: 0 → Excellent | 1-2 → Good | 3-5 → Fair | 6-9 → Poor | 10+ → Very Poor
  const getEyeContactTier = (count) => {
    if (!eyeTrackingActive)
      return {
        label: "Starting…",
        textClass: "text-slate-400",
        dotClass: "bg-slate-300",
      };
    if (count === 0)
      return {
        label: "Excellent",
        textClass: "text-green-600",
        dotClass: "bg-green-500",
      };
    if (count <= 2)
      return {
        label: "Good",
        textClass: "text-green-600",
        dotClass: "bg-green-500",
      };
    if (count <= 5)
      return {
        label: "Fair",
        textClass: "text-amber-500",
        dotClass: "bg-amber-400",
      };
    if (count <= 9)
      return {
        label: "Poor",
        textClass: "text-orange-500",
        dotClass: "bg-orange-400",
      };
    return {
      label: "Very Poor",
      textClass: "text-red-500",
      dotClass: "bg-red-500",
    };
  };

  const eyeContactTier = getEyeContactTier(lookAwayCount);
  // Override label to show currently-distracted state, but keep tier color for the status word
  const eyeContactStatus =
    trackerStatus === "warning" ? "Distracted!" : eyeContactTier.label;
  const eyeContactStatusClass =
    trackerStatus === "warning"
      ? "text-orange-500 animate-pulse"
      : eyeContactTier.textClass;
  // Dot pulses red while actively looking away, otherwise reflects cumulative tier
  const eyeContactIndicatorClass =
    trackerStatus === "warning"
      ? "bg-red-500 animate-pulse"
      : eyeContactTier.dotClass;

  const distractionsRef = useRef([
    "Coughing",
    "Door opening",
    "Falling objects",
    "Phone usage",
    "Side conversations",
    "And more...",
  ]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b-2 border-border bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Interview Simulation
          </span>

          {/* Eye Tracking Status Badge */}
          {eyeTrackingActive && (
            <span
              className={`px-2.5 py-1 border text-xs font-bold rounded-md flex items-center gap-1.5 ${
                trackerStatus === "warning"
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-green-50 border-green-200 text-green-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  trackerStatus === "warning"
                    ? "bg-orange-500 animate-pulse"
                    : "bg-green-500"
                }`}
              />
              Eye Tracking{" "}
              {trackerStatus === "warning" ? "— Look Away!" : "Active"}
            </span>
          )}
        </div>

        {/* End Session Button */}
        <Button
          variant={"danger"}
          size="sm"
          className="flex items-center gap-1.5 font-bold"
        >
          <MonitorX size={14} />
          End Session
        </Button>
      </header>

      {/* ── Audience Alert Banner ───────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-2.5 bg-violet-50 border-b-2 border-violet-100 shrink-0">
        <div className="flex-1 flex items-center justify-between">
          <div></div>
          {/* Session Timer & Disclaimer */}
          <div className="flex items-center gap-4 text-slate-700">
            <span className="text-[10px] text-slate-400 font-semibold italic">
              Timer will pause while you're away
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Session Time
              </span>
              <span className="font-mono font-black text-xl text-main">
                {formatTime(elapsed)}
              </span>
              <span className="font-mono font-bold text-slate-400">
                / {formatTime(SESSION_TOTAL)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Classroom Viewport + Camera + Live Feedback */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 bg-[#f3f7fd]">
          {/* Classroom Wireframe */}
          <div
            className="flex-1 min-h-0 w-full flex items-center justify-center"
            style={{ containerType: "size" }}
          >
            <div
              className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 relative overflow-hidden"
              style={{
                width: "min(100cqw, calc(100cqh * 16 / 9))",
                height: "min(100cqh, calc(100cqw * 9 / 16))",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center "
                style={{ backgroundImage: "url(/classroom.png)" }}
              ></div>
              {/* Floating overlays: Camera (facecam) + Feedback */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-4 pointer-events-auto z-20">
                {/* ── Live Facecam slot ── */}
                <div className="w-44 aspect-video shrink-0 rounded-2xl border-2 border-slate-200/80 bg-slate-950 relative overflow-hidden shadow-lg">
                  {/* Actual live video feed */}
                  <video
                    ref={facecamRef}
                    className="w-full h-full object-cover scale-x-[-1]"
                    muted
                    playsInline
                    autoPlay
                  />

                  {/* Overlay: searching / not-detected */}
                  {!isFaceDetected && cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="flex flex-col items-center gap-1.5 text-white/80 text-[10px] font-bold">
                        <ScanFace size={22} className="animate-pulse" />
                        <span>Searching face…</span>
                      </div>
                    </div>
                  )}

                  {/* Live badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </div>

                  {/* Eye-tracking mode badge */}
                  {eyeTrackingActive && (
                    <div
                      className={`absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md z-10 ${
                        trackerStatus === "warning"
                          ? "bg-orange-500 text-white"
                          : "bg-main/90 text-white"
                      }`}
                    >
                      <Eye size={9} />
                      <span>
                        {trackerStatus === "warning"
                          ? "DISTRACTED"
                          : "TRACKING"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Live feedback card */}
              </div>

              {/* ── Calibration overlay (sits inside the classroom area) */}
              {showCalibration && (
                <CalibrationOverlay
                  tracker={tracker}
                  onCalibrated={handleCalibrated}
                />
              )}

              {/* ── Warning glow when looking away ── */}
              {eyeTrackingActive && trackerStatus === "warning" && (
                <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl pointer-events-none animate-pulse z-20" />
              )}
            </div>
          </div>

          {/* Equipment Status Bar inside Left Column */}
          <EquipmentBar
            internetSpeed={internetSpeed}
            isCameraOn={cameraReady}
            isMicOn={cameraReady}
          />
        </div>

        {/* ── Right Panel: Cue Card / Notes ─────────────────── */}
        <div className="w-80 shrink-0 flex flex-col border-l-2 border-border bg-white overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b-2 border-border px-4 pt-3 gap-4 shrink-0">
            <button
              onClick={() => setActiveTab("cuecard")}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer border-main text-main`}
            >
              Qestion
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <>
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1">
                  Current Question
                </p>
                <p className="font-semibold text-slate-800 leading-snug mt-2">
                  If your team had different opinions about which feature should
                  be prioritized, how would you handle the conflict and help the
                  team reach a decision?
                </p>
                <div className="w-full border my-3 border-slate-300/50"></div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    Why we ask this?
                  </span>
                  <span className="text-xs font-semibold text-slate-500 leading-snug tracking-[0.3px]">
                    We ask this question to understand how you handle teamwork,
                    communication, and conflict resolution in a professional
                    environment.
                  </span>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <div className="mb-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Key Points
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex flex-col">
                  {KEY_POINTS.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* Timeline column — always blue */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-4 h-4 rounded-full border-2 border-main bg-main/20 shrink-0 mt-0.5" />
                        {i < KEY_POINTS.length - 1 && (
                          <div className="w-px flex-1 border-l-2 border-dashed border-main/40 my-1 min-h-5" />
                        )}
                      </div>

                      {/* Text — always neutral */}
                      <p className="pb-4 text-sm text-slate-500 font-medium leading-snug">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                <Lightbulb
                  size={15}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
                    Tip
                  </p>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Glance at your notes, then look back at your audience!
                  </p>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
