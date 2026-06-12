"use client";

// src/app/interview/session/page.js

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
  Loader2,
  FileText,
  Volume2,
  MessageSquare,
  MicOff,
  Check,
  Play,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { useFaceTracker } from "@/hooks/useFaceTracker";
import { useInterviewVideoController } from "@/hooks/useInterviewVideoController";
import { analyzeSpeech } from "@/utils/speechAnalysis";
import { saveSessionVideo } from "@/utils/videoStorage";

// ── Equipment Status Bar ───────────────────────────────────
function EquipmentBar({ internetSpeed, isCameraOn, isMicOn }) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 bg-white border-2 border-slate-200/80 rounded-2xl shrink-0 shadow-xs">
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

      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-main/10 rounded-full">
          <Wifi size={14} className="text-main" />
        </div>
        <span className="text-xs font-bold text-slate-700">Internet</span>
        <span className="text-xs font-semibold text-main">
          {internetSpeed} Mbps
        </span>
      </div>

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

  useEffect(() => {
    if (status === "tracking") {
      onCalibrated();
    }
  }, [status, onCalibrated]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col items-center gap-4 text-center">
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

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

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

// ── TTS helper ─────────────────────────────────────────────
let ttsVoicesCache = null;
function getIndonesianMaleVoice() {
  if (!ttsVoicesCache) {
    ttsVoicesCache = window.speechSynthesis.getVoices();
  }
  // Prefer male Indonesian voice
  const maleVoice = ttsVoicesCache.find(
    (v) =>
      v.lang.startsWith("id") &&
      (v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("pria") ||
        v.name.toLowerCase().includes("damar") ||
        v.name.toLowerCase().includes("arif"))
  );
  if (maleVoice) return maleVoice;
  // Fallback: any Indonesian voice
  return ttsVoicesCache.find((v) => v.lang.startsWith("id")) || null;
}

function speakText(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    const voice = getIndonesianMaleVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// ── Main Page ──────────────────────────────────────────────
export default function InterviewSessionPage() {
  const router = useRouter();

  const [isRedirecting, setIsRedirecting] = useState(true);

  // Guard: redirect to setup if no session configuration exists
  useEffect(() => {
    const configured = sessionStorage.getItem("interview_configured");
    if (!configured) {
      router.replace("/interview/setup");
    } else {
      setIsRedirecting(false);
    }
  }, [router]);

  // ── Interview questions ───────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("interview_questions");
      if (!raw) throw new Error("No interview data found.");
      const parsed = JSON.parse(raw);
      let qs = null;
      if (parsed.data && Array.isArray(parsed.data.interview_questions)) {
        qs = parsed.data.interview_questions;
      } else if (parsed.data && Array.isArray(parsed.data.questions)) {
        qs = parsed.data.questions;
      } else if (Array.isArray(parsed.questions)) {
        qs = parsed.questions;
      } else if (Array.isArray(parsed.data)) {
        qs = parsed.data;
      } else if (Array.isArray(parsed)) {
        qs = parsed;
      }
      if (!qs || qs.length === 0) throw new Error("No questions found.");
      setQuestions(qs);
      setQuestionsLoading(false);
    } catch (err) {
      console.error("Failed to load interview questions:", err);
      setQuestionsError(err.message);
      setQuestionsLoading(false);
    }
  }, []);

  // ── Phase state machine ───────────────────────────────────
  // "idle" | "interviewer" | "waiting_to_answer" | "user_answer" | "nodding" | "yawning" | "ending"
  const [phase, setPhase] = useState("idle");
  const [completedQuestions, setCompletedQuestions] = useState(new Set());

  // ── Infrastructure hooks ──────────────────────────────────
  const internetSpeed = useInternetSpeed();
  const SESSION_TOTAL = 600;
  const [sessionRunning, setSessionRunning] = useState(false);
  const elapsed = useSessionTimer(SESSION_TOTAL, sessionRunning);

  // ── Interview video ───────────────────────────────────────
  const interviewVideoRef = useRef(null);
  const videoController = useInterviewVideoController(interviewVideoRef);

  // ── Eye tracker ───────────────────────────────────────────
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
    switchDetectionMode,
  } = tracker;

  const facecamRef = useRef(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // ── Per-question data accumulation ────────────────────────
  const perQuestionDataRef = useRef([]);
  const pendingAnalysisRef = useRef(null); // tracks in-flight speech analysis promise
  const [isEnding, setIsEnding] = useState(false);

  // ── Per-question recording ────────────────────────────────
  const micStreamRef = useRef(null);
  const currentRecorderRef = useRef(null);
  const currentAudioChunksRef = useRef([]);
  const answerStartTimeRef = useRef(null);

  // ── Yawning 45s timer ─────────────────────────────────────
  const yawnTimerRef = useRef(null);

  // ── TTS voices ────────────────────────────────────────────
  useEffect(() => {
    const loadVoices = () => {
      ttsVoicesCache = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // ── Start camera + load model ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        switchDetectionMode("eye");
        await loadModel();
        if (cancelled) return;
        if (facecamRef.current) {
          await startCamera(facecamRef.current);
          if (cancelled) return;
          setCameraReady(true);
          setShowCalibration(true);
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

  // ── Get mic stream for per-question recording ─────────────
  useEffect(() => {
    if (!cameraReady) return;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        micStreamRef.current = stream;
      })
      .catch((err) => {
        console.error("Failed to get mic stream:", err);
      });
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraReady]);

  // ── Start per-question audio recording ────────────────────
  const startPerQuestionRecording = useCallback(() => {
    if (!micStreamRef.current) return;
    currentAudioChunksRef.current = [];
    const recorder = new MediaRecorder(micStreamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm",
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) currentAudioChunksRef.current.push(e.data);
    };
    recorder.start(1000); // 1s chunks
    currentRecorderRef.current = recorder;
  }, []);

  // ── Stop per-question recording & return blob ─────────────
  const stopPerQuestionRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = currentRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(currentAudioChunksRef.current, {
          type: "audio/webm",
        });
        resolve(blob);
      };
      recorder.stop();
      currentRecorderRef.current = null;
    });
  }, []);

  // ── Phase transitions ─────────────────────────────────────
  const goToInterviewer = useCallback(
    async (questionIdx) => {
      if (questionIdx >= questions.length) {
        // All questions done → end session
        setPhase("ending");
        setIsEnding(true);
        await handleEndSession();
        return;
      }
      setCurrentQuestionIndex(questionIdx);
      setPhase("interviewer");
      videoController.playIdleLoop();

      const q = questions[questionIdx];
      const questionText = q.question || q.title || `Question ${questionIdx + 1}`;

      // Read the question via TTS
      await speakText(questionText);

      // TTS done → wait for user to click "Answer"
      setPhase("waiting_to_answer");
    },
    [questions, videoController]
  );

  // ── User clicks "Answer" → start recording ────────────────
  const handleStartAnswer = useCallback(
    (questionIdx) => {
      setPhase("user_answer");
      answerStartTimeRef.current = Date.now();
      startPerQuestionRecording();

      // 45s yawning timer
      yawnTimerRef.current = setTimeout(() => {
        setPhase("yawning");
        videoController.playYawningOnce();
        // After yawning animation, return to user_answer
        const checkVideo = setInterval(() => {
          if (videoController.currentState !== "yawning") {
            clearInterval(checkVideo);
            setPhase("user_answer");
            videoController.playIdleLoop();
          }
        }, 200);
      }, 45000);
    },
    [videoController, startPerQuestionRecording]
  );

  // ── User clicks "Submit Answer" → stop, analyze, next ──────
  const handleSubmitAnswer = useCallback(
    async (questionIdx) => {
      // Clear yawn timer
      if (yawnTimerRef.current) {
        clearTimeout(yawnTimerRef.current);
        yawnTimerRef.current = null;
      }

      // Stop recording
      const answerDurationSecs =
        (Date.now() - (answerStartTimeRef.current || Date.now())) / 1000;
      const audioBlob = await stopPerQuestionRecording();

      // Calculate distraction during this question
      const distractDuration = totalDistractedTime || 0;

      // Play nodding animation
      setPhase("nodding");
      videoController.playNoddingOnce();

      // Send audio for speech analysis — use server-side transcription
      let analysisResult = null;
      let transcript = "";
      let fillerCount = 0;
      let wpm = 0;

      if (audioBlob && audioBlob.size > 0) {
        try {
          const res = await analyzeSpeech(audioBlob);
          analysisResult = res?.data || res?.analysis || res;

          // Extract server-side transcription (more accurate than browser SpeechRecognition)
          transcript =
            analysisResult?.transcription ||
            analysisResult?.analysis?.transcription ||
            analysisResult?.transcript ||
            analysisResult?.analysis?.transcript ||
            "";

          // Calculate WPM from server transcript: word count / minutes
          if (transcript && answerDurationSecs > 0) {
            const wordCount = transcript
              .split(/\s+/)
              .filter((w) => w.length > 0).length;
            const minutes = answerDurationSecs / 60;
            wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;
          }

          fillerCount =
            analysisResult?.analysis?.filler_words?.total_filler_count ||
            analysisResult?.filler_words?.total_filler_count ||
            0;
        } catch (err) {
          console.error("Speech analysis failed:", err);
        }
      }

      // Accumulate per-question data
      perQuestionDataRef.current[questionIdx] = {
        question_number: questionIdx + 1,
        question_text: questions[questionIdx]?.question || questions[questionIdx]?.title || "",
        user_answer: transcript,
        answer_duration_seconds: Math.round(answerDurationSecs),
        filler_words_count: fillerCount,
        distract_duration_seconds: Math.round(distractDuration),
        wpm,
        speech_analysis: analysisResult,
      };

      // Mark as completed
      setCompletedQuestions((prev) => new Set(prev).add(questionIdx));

      // Wait for nodding animation to finish before next question
      const checkNodDone = setInterval(() => {
        if (videoController.currentState !== "nodding") {
          clearInterval(checkNodDone);
          videoController.playIdleLoop();
          goToInterviewer(questionIdx + 1);
        }
      }, 200);
    },
    [
      questions,
      videoController,
      stopPerQuestionRecording,
      totalDistractedTime,
      goToInterviewer,
    ]
  );

  // ── End session ───────────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    // Wait for any pending analysis
    if (pendingAnalysisRef.current) {
      await pendingAnalysisRef.current;
    }

    // Build evaluate payload
    const sessions = perQuestionDataRef.current
      .filter(Boolean)
      .map((q) => ({
        question_number: q.question_number,
        question_text: q.question_text,
        user_answer: q.user_answer,
        answer_duration_seconds: q.answer_duration_seconds,
        filler_words_count: q.filler_words_count,
        distract_duration_seconds: q.distract_duration_seconds,
      }));

    let evaluateData = null;

    // Retrieve the documentId saved during setup
    let documentId = sessionStorage.getItem("interview_document_id");
    if (!documentId) {
      try {
        const rawQuestions = sessionStorage.getItem("interview_questions");
        if (rawQuestions) {
          const parsed = JSON.parse(rawQuestions);
          documentId =
            parsed?.meta?.document_id ||
            parsed?.meta?.documentId ||
            parsed?.document_id ||
            parsed?.documentId ||
            parsed?.data?.document_id ||
            parsed?.data?.documentId;
        }
      } catch (err) {
        console.warn("Failed to retrieve documentId from interview_questions:", err);
      }
    }

    try {
      const res = await fetch(
        "https://pitcho-be.vercel.app/api/interview/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessions,
            documentId: documentId || undefined,
            document_id: documentId || undefined,
          }),
        }
      );
      if (res.ok) {
        evaluateData = await res.json();
      } else {
        console.error("Evaluate API failed:", res.status);
      }
    } catch (err) {
      console.error("Evaluate API error:", err);
    }

    // Save everything to sessionStorage
    sessionStorage.setItem(
      "interview_results",
      JSON.stringify({
        per_question_data: perQuestionDataRef.current.filter(Boolean),
        evaluate_response: evaluateData,
        lookAwayEvents: lookAwayEvents || [],
        documentId: documentId || null,
        document_id: documentId || null,
      })
    );

    // Stop eye tracker and get recording blobs
    try {
      const { videoBlob, audioBlob } = await stopTracker();
      // Save video to IndexedDB for replay in result page
      if (videoBlob && videoBlob.size > 0) {
        await saveSessionVideo(videoBlob);
      }
    } catch (err) {
      console.error("Failed to save session recording:", err);
    }

    // Navigate to result
    router.push("/interview/result");
  }, [router, stopTracker, lookAwayEvents]);

  // ── Calibration complete → start interview ────────────────
  const handleCalibrated = useCallback(() => {
    setShowCalibration(false);
    setEyeTrackingActive(true);
    setSessionRunning(true);
    // Start recording face cam video
    startRecording();
    if (facecamRef.current) {
      runDetectionLoop(facecamRef.current, "tracking");
    }
    // Start the first question
    if (questions.length > 0) {
      goToInterviewer(0);
    }
  }, [runDetectionLoop, startRecording, questions, goToInterviewer]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (yawnTimerRef.current) {
        clearTimeout(yawnTimerRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      // Stop face tracker (camera, recording)
      try {
        stopTracker();
      } catch (_) {}
    };
  }, []);

  // ── Eye contact tier ──────────────────────────────────────
  const getEyeContactTier = (count) => {
    if (!eyeTrackingActive)
      return { label: "Starting…", textClass: "text-slate-400", dotClass: "bg-slate-300" };
    if (count <= 2)
      return { label: "Good", textClass: "text-green-600", dotClass: "bg-green-500" };
    if (count <= 5)
      return { label: "Fair", textClass: "text-amber-500", dotClass: "bg-amber-400" };
    if (count <= 9)
      return { label: "Poor", textClass: "text-orange-500", dotClass: "bg-orange-400" };
    return { label: "Very Poor", textClass: "text-red-500", dotClass: "bg-red-500" };
  };

  const eyeContactTier = getEyeContactTier(lookAwayCount);
  const eyeContactStatus =
    trackerStatus === "warning" ? "Distracted!" : eyeContactTier.label;
  const eyeContactStatusClass =
    trackerStatus === "warning"
      ? "text-orange-500 animate-pulse"
      : eyeContactTier.textClass;
  const eyeContactIndicatorClass =
    trackerStatus === "warning"
      ? "bg-red-500 animate-pulse"
      : eyeContactTier.dotClass;

  // ── Phase label ───────────────────────────────────────────
  const phaseLabel = {
    idle: "Preparing…",
    interviewer: "AI is asking a question…",
    waiting_to_answer: "Ready to answer?",
    user_answer: "Recording your answer…",
    nodding: "Great answer!",
    yawning: "Keep it concise!",
    ending: "Finishing session…",
  }[phase];

  // Redirect loading spinner
  if (isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-main animate-spin" />
          <span className="text-sm font-bold text-slate-400">Loading interview…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b-2 border-border bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Interview Simulation
          </span>

          {/* Phase badge */}
          <span
            className={`px-2.5 py-1 border text-xs font-bold rounded-md flex items-center gap-1.5 ${
              phase === "user_answer"
                ? "bg-red-50 border-red-200 text-red-600"
                : phase === "interviewer"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : phase === "nodding"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                phase === "user_answer"
                  ? "bg-red-500 animate-pulse"
                  : phase === "interviewer"
                    ? "bg-blue-500"
                    : phase === "nodding"
                      ? "bg-green-500"
                      : "bg-slate-400"
              }`}
            />
            {phaseLabel}
          </span>

          {/* Question counter */}
          <span className="text-xs font-bold text-slate-400">
            Q {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
          </span>
        </div>

        {/* Eye Tracking Status */}
        {eyeTrackingActive && (
          <span
            className={`px-2.5 py-1 border text-xs font-bold rounded-md flex items-center gap-1.5 ${
              trackerStatus === "warning"
                ? "bg-orange-50 border-orange-200 text-orange-600"
                : "bg-green-50 border-green-200 text-green-600"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${eyeContactIndicatorClass}`} />
            Eye Tracking {trackerStatus === "warning" ? "— Look Away!" : "Active"}
          </span>
        )}

        <Button
          variant={"danger"}
          size="sm"
          className="flex items-center gap-1.5 font-bold"
          onClick={() => {
            setIsEnding(true);
            setPhase("ending");
            handleEndSession();
          }}
        >
          <MonitorX size={14} />
          End Session
        </Button>
      </header>

      {/* ── Phase Banner ───────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-2.5 bg-violet-50 border-b-2 border-violet-100 shrink-0">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {phase === "interviewer" && (
              <Volume2 size={14} className="text-violet-500 animate-pulse" />
            )}
            {phase === "user_answer" && (
              <Mic size={14} className="text-red-500 animate-pulse" />
            )}
            {phase === "waiting_to_answer" && (
              <MessageSquare size={14} className="text-main" />
            )}
            <span className="text-xs font-bold text-violet-700">
              {phase === "interviewer"
                ? "Listen carefully to the question…"
                : phase === "user_answer"
                  ? "Recording your answer — click Submit when done"
                  : phase === "waiting_to_answer"
                    ? "Click \"Answer\" when you're ready to respond"
                    : phaseLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Action Buttons */}
            {phase === "waiting_to_answer" && (
              <button
                onClick={() => handleStartAnswer(currentQuestionIndex)}
                className="h-9 bg-main hover:bg-blue-700 text-white font-extrabold text-xs px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_#1e40af] active:translate-y-[2px] active:shadow-none"
              >
                <Play size={14} fill="white" />
                Answer
              </button>
            )}
            {phase === "user_answer" && (
              <button
                onClick={() => handleSubmitAnswer(currentQuestionIndex)}
                className="h-9 bg-[#58cc02] hover:bg-[#58a700] text-white font-extrabold text-xs px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_#58a700] active:translate-y-[2px] active:shadow-none"
              >
                <CheckCircle size={14} />
                Submit Answer
              </button>
            )}

            <span className="text-[10px] text-slate-400 font-semibold italic">
              Session in progress
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Time
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
        {/* Left: Video Viewport + Camera + Live Feedback */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4 bg-[#f3f7fd]">
          {/* Interview Video + Facecam */}
          <div
            className="flex-1 min-h-0 w-full flex items-center justify-center"
            style={{ containerType: "size" }}
          >
            <div
              className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-950 relative overflow-hidden"
              style={{
                width: "min(100cqw, calc(100cqh * 16 / 9))",
                height: "min(100cqh, calc(100cqw * 9 / 16))",
              }}
            >
              {/* Interviewer video */}
              <video
                ref={interviewVideoRef}
                src="/interview.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                onLoadedData={videoController.onVideoReady}
                onTimeUpdate={videoController.handleTimeUpdate}
              />

              {/* Phase overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-center z-10 pointer-events-none">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-sm ${
                    phase === "yawning"
                      ? "bg-orange-500/80 text-white"
                      : phase === "nodding"
                        ? "bg-green-500/80 text-white"
                        : phase === "user_answer"
                          ? "bg-red-500/80 text-white"
                          : "bg-white/80 text-slate-700"
                  }`}
                >
                  {phaseLabel}
                </span>
              </div>

              {/* Facecam */}
              <div className="absolute bottom-4 left-4 w-44 aspect-video shrink-0 rounded-2xl border-2 border-slate-200/80 bg-slate-950 relative overflow-hidden shadow-lg z-10">
                <video
                  ref={facecamRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  muted
                  playsInline
                  autoPlay
                />
                {!isFaceDetected && cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <div className="flex flex-col items-center gap-1.5 text-white/80 text-[10px] font-bold">
                      <ScanFace size={22} className="animate-pulse" />
                      <span>Searching face…</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
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
                      {trackerStatus === "warning" ? "DISTRACTED" : "TRACKING"}
                    </span>
                  </div>
                )}
              </div>

              {/* Calibration overlay */}
              {showCalibration && (
                <CalibrationOverlay
                  tracker={tracker}
                  onCalibrated={handleCalibrated}
                />
              )}

              {/* Warning glow when distracted */}
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

        {/* ── Right Panel: Questions ────────────────────────── */}
        <div className="w-80 shrink-0 flex flex-col border-l-2 border-border bg-white overflow-hidden">
          <div className="flex border-b-2 border-border px-4 pt-3 gap-4 shrink-0">
            <button
              onClick={() => {}}
              className="pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer border-main text-main"
            >
              Questions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {questionsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={32} className="text-main animate-spin" />
                <span className="text-xs font-bold text-slate-400">Loading questions…</span>
              </div>
            ) : questionsError ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
                <CircleAlert size={32} className="text-red-400" />
                <span className="text-xs font-bold text-red-500 text-center">{questionsError}</span>
                <button
                  onClick={() => router.push("/interview/setup")}
                  className="text-xs font-bold text-main underline cursor-pointer mt-2"
                >
                  Go back to setup
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <FileText size={32} className="text-slate-300" />
                <span className="text-xs font-bold text-slate-400">No questions available</span>
              </div>
            ) : (
              <>
                {/* Question List */}
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                    Questions ({questions.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {questions.map((q, i) => {
                      const isCompleted = completedQuestions.has(i);
                      const isCurrent = i === currentQuestionIndex;
                      return (
                        <button
                          key={q.id || i}
                          onClick={() => {
                            // Allow clicking to review, but don't interrupt active session
                            setCurrentQuestionIndex(i);
                          }}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            isCurrent
                              ? "border-main bg-main/10"
                              : isCompleted
                                ? "border-green-200 bg-green-50/50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                isCurrent
                                  ? "bg-main text-white"
                                  : isCompleted
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {isCompleted ? <Check size={10} strokeWidth={3} /> : i + 1}
                            </span>
                            <span
                              className={`text-xs font-semibold leading-snug line-clamp-2 ${
                                isCurrent ? "text-main" : "text-slate-600"
                              }`}
                            >
                              {q.question || q.title || `Question ${i + 1}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Question Detail */}
                {questions[currentQuestionIndex] && (() => {
                  const q = questions[currentQuestionIndex];
                  const reasoning = q.reasoning || q.why_ask;
                  const keyPoints = q.key_points;
                  const tip = q.tip;
                  return (
                    <>
                      <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-violet-400">
                            Current Question
                          </p>
                          {q.category && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-200 text-violet-700">
                              {q.category}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug mt-2">
                          {q.question || q.title || "Question text"}
                        </p>

                        {reasoning && (
                          <>
                            <div className="w-full border my-3 border-slate-300/50" />
                            <div className="flex flex-col gap-3">
                              <span className="text-xs font-bold text-slate-500">
                                Why we ask this?
                              </span>
                              <span className="text-xs font-semibold text-slate-500 leading-snug tracking-[0.3px]">
                                {reasoning}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {keyPoints && keyPoints.length > 0 && (
                        <div>
                          <div className="mb-3">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                              Key Points
                            </span>
                          </div>
                          <div className="flex flex-col">
                            {keyPoints.map((point, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="w-4 h-4 rounded-full border-2 border-main bg-main/20 shrink-0 mt-0.5" />
                                  {i < keyPoints.length - 1 && (
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

                      {tip && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                          <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
                              Tip
                            </p>
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                              {tip}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ending overlay */}
      {isEnding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
            <Loader2 size={40} className="text-main animate-spin" />
            <p className="text-sm font-bold text-slate-700 text-center">
              Analyzing your interview performance…
            </p>
            <div className="w-full space-y-2">
              <div className="h-2 bg-slate-100 rounded animate-pulse" />
              <div className="h-2 bg-slate-100 rounded animate-pulse w-4/5" />
              <div className="h-2 bg-slate-100 rounded animate-pulse w-3/5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
