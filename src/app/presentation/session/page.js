"use client";

// src/app/presentation/session/page.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { useFaceTracker } from "@/hooks/useFaceTracker";
import { useSpeechTracker } from "@/hooks/useSpeechTracker";
import { saveSessionVideo, clearSessionVideo } from "@/utils/videoStorage";
import { analyzeSpeech } from "@/utils/speechAnalysis";
import { extractClip } from "@/utils/clipExtractor";
import { uploadClip, saveSession } from "@/lib/api";
import { calculateSessionScore } from "@/utils/scoring";
import { useVideoController } from "@/hooks/useVideoController";
import { useDistractionSchedule } from "@/hooks/useDistractionSchedule";
import { useDistractionEngine } from "@/hooks/useDistractionEngine";

// ── Key points (iterable) ──────────────────────────────────
const KEY_POINTS = [
  "Start with a hook about how work culture has changed.",
  "Explain the benefits of remote work for employees.",
  "Discuss challenges faced by remote teams.",
  "Share strategies to overcome those challenges.",
  "End with your takeaways and a strong closing.",
];

// ── Distraction types listed in cue card ──────────────────
const DISTRACTION_TYPES = [
  { icon: Mic, label: "Coughing" },
  { icon: Monitor, label: "Door opening" },
  { icon: Activity, label: "Falling objects" },
  { icon: Camera, label: "Phone usage" },
  { icon: Eye, label: "Side conversations" },
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
function useSessionTimer(running) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);
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
  const router = useRouter();
  const internetSpeed = useInternetSpeed();

  // ── Eye Tracker integration ─────────────────────────────
  const tracker = useFaceTracker();
  const {
    status: trackerStatus,
    isFaceDetected,
    lookAwayCount,
    lookAwayEvents,
    totalDistractedTime,
    loadModel,
    startCamera,
    startRecording,
    runDetectionLoop,
    stopTracker,
    getAudioBlob,
    switchDetectionMode,
  } = tracker;

  const [sessionDuration, setSessionDuration] = useState(600); // dynamic duration in seconds
  const [presentationTitle, setPresentationTitle] = useState(
    "The Future of Remote Work",
  );
  const [distractionLevel, setDistractionLevel] = useState("High Distraction");
  const [sessionCueCards, setSessionCueCards] = useState([]);
  const [sessionActiveSlide, setSessionActiveSlide] = useState(0);

  const [sessionRunning, setSessionRunning] = useState(false);
  const elapsed = useSessionTimer(sessionRunning);
  const [totalSessionTime, setTotalSessionTime] = useState(0);

  useEffect(() => {
    if (!sessionRunning) return;
    const interval = setInterval(() => {
      setTotalSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionRunning]);

  // ── Speech Tracker integration ────────────────────────────
  const speechTracker = useSpeechTracker();
  const {
    isListening: isSpeechListening,
    error: speechError,
    currentWpm,
    currentStatus,
    totalWordCount: speechWordCount,
    averageWpm: speechAverageWpm,
    segmentData: speechSegmentData,
    transcript,
    isSupported: isSpeechSupported,
    startListening: startSpeechTracking,
    stopListening: stopSpeechTracking,
  } = speechTracker;

  // ── Classroom Video Controller ──────────────────────────────
  const classroomVideoRef = useRef(null);
  const videoController = useVideoController(classroomVideoRef);

  // ── Distraction Schedule Generator ─────────────────────────
  const distractionSchedule = useDistractionSchedule();
  // Resolve the localStorage key at render time for difficulty
  const storedDistractionKey =
    typeof window !== "undefined"
      ? localStorage.getItem("pitcho_selected_distraction") || "medium"
      : "medium";
  const difficultyMap = { low: "easy", medium: "medium", hard: "hard" };
  const difficultyKey = difficultyMap[storedDistractionKey] || "medium";

  // ── Distraction Runtime Engine ──────────────────────────────
  const { nextEvent } = useDistractionEngine({
    sessionRunning,
    elapsed,
    schedule: distractionSchedule.schedule,
    playDistraction: videoController.playDistraction,
    currentVideoState: videoController.currentState,
  });

  const [activeKeyPoint, setActiveKeyPoint] = useState(0);
  const [activeTab, setActiveTab] = useState("cuecard"); // 'cuecard' | 'notes'

  useEffect(() => {
    // Guard: redirect to setup if no session configuration exists
    const storedDuration = localStorage.getItem("pitcho_selected_duration");
    if (!storedDuration) {
      router.replace("/presentation/setup");
      return;
    }

    const storedFile = localStorage.getItem("pitcho_presentation_file");
    const storedDistraction = localStorage.getItem(
      "pitcho_selected_distraction",
    );
    const storedCueCards = localStorage.getItem("pitcho_cue_cards");

    if (storedFile) {
      try {
        const file = JSON.parse(storedFile);
        if (file && file.name) {
          setPresentationTitle(file.name);
        }
      } catch (e) {
        console.error("Failed to parse presentation file:", e);
      }
    }

    if (storedDistraction) {
      setDistractionLevel(
        storedDistraction === "low"
          ? "Low Distraction"
          : storedDistraction === "medium"
            ? "Medium Distraction"
            : "High Distraction",
      );
    }

    if (storedDuration) {
      const minutes = parseInt(storedDuration, 10) || 10;
      setSessionDuration(minutes * 60);
    }

    if (storedCueCards) {
      try {
        const cards = JSON.parse(storedCueCards);
        if (Array.isArray(cards) && cards.length > 0) {
          setSessionCueCards(cards);
        }
      } catch (e) {
        console.error("Failed to parse cue cards:", e);
      }
    }
  }, []);

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
    // Start recording the session video
    startRecording();

    // Start speech-to-text tracking for WPM analysis
    startSpeechTracking(sessionDuration);

    // Generate distraction schedule for this session
    distractionSchedule.generateSchedule(sessionDuration, difficultyKey);
    // Ensure classroom video is playing (user gesture from calibration click)
    if (classroomVideoRef.current) {
      classroomVideoRef.current.play().catch(() => {});
    }
  }, [
    runDetectionLoop,
    startRecording,
    startSpeechTracking,
    sessionDuration,
    difficultyKey,
    distractionSchedule,
  ]);

  // ── End Session handler ─────────────────────────────────
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSession = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);
    try {
      // 0. Stop classroom video
      videoController.stopVideo();

      // 1. Stop speech tracking to get final WPM data
      const speechData = stopSpeechTracking();

      // 2. Stop tracker/recording and get the video + audio blobs
      const { videoBlob, audioBlob } = await stopTracker();

      // 3. Save metadata to localStorage
      const sessionData = {
        lookAwayEvents,
        lookAwayCount,
        sessionDuration: totalSessionTime,
        totalDistractedTime,
        // Speech / WPM data
        transcript: speechData?.transcript || "",
        totalWordCount: speechData?.totalWordCount || 0,
        averageWpm: speechData?.averageWpm || 0,
        speechSegments: speechData?.speechSegments || [],
      };
      localStorage.setItem("pitcho_session_data", JSON.stringify(sessionData));

      // 4. Save video blob to IndexedDB
      if (videoBlob) {
        await saveSessionVideo(videoBlob);
      }

      // 5. Upload audio for speech analysis (non-fatal on failure)
      try {
        const response = await analyzeSpeech(audioBlob);
        if (response?.success && response?.data) {
          localStorage.setItem(
            "pitcho_speech_analysis",
            JSON.stringify(response.data),
          );
        }
      } catch (analysisErr) {
        console.warn(
          "Speech analysis failed, continuing without it:",
          analysisErr,
        );
      }

      // 6. Save session to backend (non-blocking — failures don't stop navigation)
      try {
        // ── Load session config from localStorage ──────────
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

        const documentId = storedFile?.documentId || "00000000-0000-0000-0000-000000000000";
        const name = storedFile?.name || "Untitled";

        // Map distraction / audience to title case
        const distractionIntensity =
          storedDistraction.charAt(0).toUpperCase() + storedDistraction.slice(1);
        const audienceType =
          storedAudience.charAt(0).toUpperCase() + storedAudience.slice(1);
        const sessionLength = parseInt(storedDuration, 10) || 1;

        // ── Upload distraction clips ──────────────────────
        const distractionClips = [];
        if (videoBlob && lookAwayEvents.length > 0) {
          for (const event of lookAwayEvents) {
            try {
              const clipStart = Math.max(0, (event.timestamp || 0) - 2);
              const clipEnd = Math.min(
                totalSessionTime,
                (event.timestamp || 0) + (event.duration || 3) + 2,
              );
              const clipDuration = clipEnd - clipStart;

              // Extract clip from full video via canvas + MediaRecorder
              const clipBlob = await extractClip(videoBlob, clipStart, clipDuration);

              if (clipBlob) {
                const uploadResult = await uploadClip(clipBlob, {
                  type: event.type || "Look Away",
                  timestamp_start: Math.round(clipStart),
                  timestamp_end: Math.round(clipEnd),
                  duration: Math.round(clipDuration),
                });

                if (uploadResult?.video_url) {
                  distractionClips.push({
                    video_url: uploadResult.video_url,
                    type: event.type || "Look Away",
                    timestamp_start: Math.round(clipStart),
                    timestamp_end: Math.round(clipEnd),
                    duration: Math.round(clipDuration),
                  });
                }
              }
            } catch (clipErr) {
              console.warn("Clip extraction/upload failed for event:", event.id, clipErr);
            }
          }
        }

        // ── Map speech analysis data ──────────────────────
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

        // Prefer transcript from analysis, fall back to speech tracker
        const transcript =
          analysis.transcript || speechData?.transcript || "";

        // ── Calculate scores ──────────────────────────────
        const scoreInput = {
          sessionDuration: totalSessionTime,
          totalWordCount: speechData?.totalWordCount || 0,
          averageWpm: speechData?.averageWpm || 0,
          totalDistractedTime,
        };
        const analysisInput = storedAnalysis;
        const scoreResult = calculateSessionScore(scoreInput, analysisInput);

        // ── Build payload and POST to /api/history ────────
        const payload = {
          practice_type: "PRESENTATION",
          document_id: documentId,
          name,
          distraction_intensity: distractionIntensity,
          audience_type: audienceType,
          session_length: sessionLength,
          transcript,
          distract_count: lookAwayCount,
          total_distract_duration: Math.round(totalDistractedTime),
          total_duration: Math.round(totalSessionTime),
          wpm: Math.round(speechData?.averageWpm || 0),
          efficiency_score: scoreResult.breakdown.efficiency,
          overall_score: scoreResult.overallScore,
          filler_incidents: fillerIncidents,
          word_findings: wordFindings,
          interview_details: [],
          distraction_clips: distractionClips,
        };

        await saveSession(payload);
      } catch (saveErr) {
        console.warn("Failed to save session to backend:", saveErr);
      }

      // 7. Navigate to result page
      router.push("/presentation/result");
    } catch (err) {
      console.error("Failed to end session:", err);
      setIsEnding(false);
    }
  }, [
    isEnding,
    stopSpeechTracking,
    stopTracker,
    lookAwayEvents,
    lookAwayCount,
    totalSessionTime,
    totalDistractedTime,
    router,
    videoController,
  ]);

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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden relative">
      {totalSessionTime > sessionDuration && (
        <>
          {/* Pulsing Red Border and Inset Glow with Ping animation */}
          <div className="absolute inset-0 border-4 pointer-events-none z-50 animate-border-ping" />

          {/* Floating warning banner */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white font-extrabold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-ambulance-flash border-2 border-white pointer-events-auto">
            <span className="text-base animate-pulse">⚠️</span>
            <span className="text-xs tracking-wide uppercase">
              Time is over, please stop the session as soon as possible.
            </span>
          </div>
        </>
      )}
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b-2 border-border bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Presentation Simulation
          </span>
          {/* Distraction Badge */}
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
              distractionLevel === "Low Distraction"
                ? "bg-green-50 border-green-200 text-green-600"
                : distractionLevel === "Medium Distraction"
                  ? "bg-yellow-50 border-yellow-250 text-yellow-600"
                  : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {distractionLevel}
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
          onClick={handleEndSession}
          disabled={isEnding}
        >
          <MonitorX size={14} />
          {isEnding ? "Ending..." : "End Session"}
        </Button>
      </header>

      {/* ── Audience Alert Banner ───────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-2.5 bg-violet-50 border-b-2 border-violet-100 shrink-0">
        <div className="p-1.5 bg-violet-100 rounded-full">
          <CircleAlert size={15} className="text-violet-600" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-violet-800">
              Audience Alert&nbsp;
            </span>
            <span className="text-sm text-violet-600">
              Unexpected events will test your focus and composure. Stay calm
              and keep going!
            </span>
          </div>
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
                / {formatTime(sessionDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Speech Recognition Compatibility Banner ──────────── */}
      {!isSpeechSupported && (
        <div className="flex items-center gap-2 px-6 py-1.5 bg-amber-50 border-b border-amber-100 shrink-0">
          <CircleAlert size={12} className="text-amber-500 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-700">
            Speech recognition is not supported in this browser. WPM tracking
            requires Chrome or Edge.
          </span>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Classroom Viewport + Camera + Live Feedback */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 bg-[#f3f7fd]">
          {/* Classroom Video Viewport */}
          <div
            className="flex-1 min-h-0 w-full flex items-center justify-center"
            style={{ containerType: "size" }}
          >
            <div
              className="rounded-2xl relative overflow-hidden bg-black"
              style={{
                width: "min(100cqw, calc(100cqh * 16 / 9))",
                height: "min(100cqh, calc(100cqw * 9 / 16))",
              }}
            >
              {/* Classroom Video */}
              <video
                ref={classroomVideoRef}
                src="/classroom.mp4"
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                onLoadedData={videoController.onVideoReady}
                onTimeUpdate={videoController.handleTimeUpdate}
              />

              {/* ── Facecam + Feedback overlays ── */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3 pointer-events-auto z-20">
                {/* Facecam (bottom-left) */}
                <div className="w-72 aspect-video shrink-0 rounded-2xl border-2 border-white/30 bg-slate-950 relative overflow-hidden shadow-lg">
                  <video
                    ref={facecamRef}
                    className="w-full h-full object-cover scale-x-[-1]"
                    muted
                    playsInline
                    autoPlay
                  />
                  {!isFaceDetected && cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="flex flex-col items-center gap-1 text-white/80 text-[10px] font-bold">
                        <ScanFace size={20} className="animate-pulse" />
                        <span>Searching face…</span>
                      </div>
                    </div>
                  )}
                  {eyeTrackingActive && (
                    <div
                      className={`absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md z-10 ${
                        trackerStatus === "warning"
                          ? "bg-orange-500 text-white"
                          : "bg-main/90 text-white"
                      }`}
                    >
                      <Eye size={9} />
                      {trackerStatus === "warning" ? "DISTRACTED" : "TRACKING"}
                    </div>
                  )}
                </div>

                {/* Compact Live Feedback (bottom-right) */}
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
                  {/* Live label */}
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Live Analytics
                  </span>
                  {/* Divider */}
                  <div className="w-px h-4 bg-white/20" />
                  {/* Status icon */}
                  <div className="shrink-0">
                    {trackerStatus === "warning" ? (
                      <AlertTriangle size={14} className="text-orange-400" />
                    ) : (
                      <CheckCircle size={14} className="text-emerald-400" />
                    )}
                  </div>
                  {/* Eye Contact */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${eyeContactIndicatorClass}`}
                    />
                    <span className="text-[10px] font-semibold text-white/70">
                      {eyeContactStatus}
                    </span>
                  </div>
                  {/* Divider */}
                  <div className="w-px h-4 bg-white/20" />
                  {/* Speaking Pace */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        currentStatus === "Ideal Pace"
                          ? "bg-green-400"
                          : currentStatus === "Slightly Fast"
                            ? "bg-orange-400"
                            : currentStatus === "Too Fast"
                              ? "bg-red-400"
                              : currentStatus === "Too Slow"
                                ? "bg-blue-400"
                                : "bg-white/30"
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-white/70">
                      {isSpeechListening ? `${currentWpm} wpm` : "-- wpm"}
                    </span>
                  </div>
                </div>
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

          {/* Equipment Status Bar */}
          <EquipmentBar
            internetSpeed={internetSpeed}
            isCameraOn={cameraReady}
            isMicOn={cameraReady}
          />
        </div>

        {/* ── Right Panel: Cue Card / Notes ─────────────────── */}
        <div className="w-80 shrink-0 flex flex-col border-l-2 border-border bg-white overflow-hidden">
          {/* Tab Header */}
          {sessionCueCards.length > 0 && (
            <div className="flex border-b-2 border-border px-4 pt-3 gap-4 shrink-0">
              <button
                onClick={() => setActiveTab("cuecard")}
                className={`pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "cuecard"
                    ? "border-main text-main"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Cue Card
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "notes"
                    ? "border-main text-main"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Notes
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sessionCueCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center gap-4">
                <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                  <FileText size={36} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h5 className="font-bold text-slate-800 text-sm">
                    No Material Uploaded
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    You are not uploading a material. Add material to unlock
                    this feature.
                  </p>
                </div>
              </div>
            ) : activeTab === "cuecard" ? (
              <>
                {/* Presentation Title */}
                <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1">
                    Presentation Title
                  </p>
                  <p className="font-bold text-slate-800 text-sm leading-snug break-words">
                    {presentationTitle}
                  </p>
                </div>

                {/* Key Points / Slide Carousel */}
                {sessionCueCards.length > 0 ? (
                  (() => {
                    const activeSlide =
                      sessionCueCards[sessionActiveSlide] || {};
                    const isSlideObject =
                      typeof activeSlide === "object" && activeSlide !== null;

                    const title = isSlideObject
                      ? activeSlide.title || `Slide ${sessionActiveSlide + 1}`
                      : activeSlide;
                    const talkingPoints = isSlideObject
                      ? activeSlide.talking_points || []
                      : [];
                    const transitionSentence = isSlideObject
                      ? activeSlide.transition_sentence
                      : "";

                    return (
                      <div className="flex flex-col gap-4">
                        {/* Carousel Header Controls */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <span className="text-xs font-bold text-slate-700">
                            Slide {sessionActiveSlide + 1} of{" "}
                            {sessionCueCards.length}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setSessionActiveSlide((prev) =>
                                  Math.max(0, prev - 1),
                                )
                              }
                              disabled={sessionActiveSlide === 0}
                              className="p-1 rounded-md border border-slate-200 bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                              title="Previous Slide"
                            >
                              <ChevronLeft
                                size={14}
                                className="text-slate-600"
                              />
                            </button>
                            <button
                              onClick={() =>
                                setSessionActiveSlide((prev) =>
                                  Math.min(
                                    sessionCueCards.length - 1,
                                    prev + 1,
                                  ),
                                )
                              }
                              disabled={
                                sessionActiveSlide ===
                                sessionCueCards.length - 1
                              }
                              className="p-1 rounded-md border border-slate-200 bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                              title="Next Slide"
                            >
                              <ChevronRight
                                size={14}
                                className="text-slate-600"
                              />
                            </button>
                          </div>
                        </div>

                        {/* 1. Slide Title */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                            Slide Title
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 leading-snug bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                            {title}
                          </h5>
                        </div>

                        {/* 2. Talking Points */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                            Speaking Guide
                          </span>
                          <div className="flex flex-col gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/50 min-h-[80px]">
                            {talkingPoints.length > 0 ? (
                              talkingPoints.map((point, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-main font-bold shrink-0 mt-0.5">
                                    •
                                  </span>
                                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {point}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No speaking notes.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 3. Transition Sentence */}
                        {transitionSentence && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                              Next Slide Bridge
                            </span>
                            <div className="text-xs text-slate-700 font-medium italic leading-relaxed bg-amber-50 border border-amber-100 p-2.5 rounded-lg flex items-start gap-2">
                              <span className="text-amber-500 shrink-0 mt-0.5">
                                🔗
                              </span>
                              <span>"{transitionSentence}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* Timeline Fallback */
                  <div>
                    <div className="mb-3">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        Key Points
                      </span>
                    </div>

                    <div className="flex flex-col">
                      {KEY_POINTS.map((point, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-4 h-4 rounded-full border-2 border-main bg-main/20 shrink-0 mt-0.5" />
                            {i < KEY_POINTS.length - 1 && (
                              <div className="w-px flex-1 border-l-2 border-dashed border-main/40 my-1 min-h-5" />
                            )}
                          </div>
                          <p className="pb-4 text-sm text-slate-500 font-medium leading-snug">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Distractions may include */}
                <div className="pt-2 border-t-2 border-border">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    Distractions may include:
                  </p>
                  <div className="flex flex-col gap-2">
                    {DISTRACTION_TYPES.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon size={12} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-500">
                          {label}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">
                        And more...
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Notes Tab */
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-400">
                  Your personal notes for this session.
                </p>
                <textarea
                  className="w-full h-64 text-sm text-slate-700 border-2 border-border rounded-xl p-3 resize-none focus:outline-none focus:border-main font-medium placeholder:text-slate-300"
                  placeholder="Type your notes here..."
                />
                <p className="text-[10px] text-slate-300 font-medium">
                  Notes are only visible to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
