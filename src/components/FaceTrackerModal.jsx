"use client";

import { useEffect, useRef, useState } from "react";

export default function FaceTrackerModal({
  isOpen,
  onClose,
  tracker,
  onStartTracking,
}) {
  const [step, setStep] = useState(1); // 1: Mode Selection, 2: Camera & Calibration
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const videoRef = useRef(null);

  const {
    isLoading,
    error,
    status,
    detectionMode,
    isFaceDetected,
    loadModel,
    startCamera,
    startCalibration,
    runDetectionLoop,
    switchDetectionMode,
  } = tracker;

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCalibrationProgress(0);
    }
  }, [isOpen]);

  // Step 1 → Step 2: load model + start camera
  const handleProceedToCamera = async () => {
    try {
      await loadModel();
      setStep(2);
      setTimeout(async () => {
        if (videoRef.current) {
          await startCamera(videoRef.current);
          runDetectionLoop(videoRef.current, "alignment");
        }
      }, 200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCalibration = () => {
    if (status !== "calibrating") {
      startCalibration();
    }
  };

  useEffect(() => {
    if (status === "calibrating") {
      const interval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 2.5;
        });
      }, 40);
      return () => clearInterval(interval);
    } else {
      setCalibrationProgress(0);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-zinc-200 text-zinc-950 shadow-2xl transition-all duration-300">
        
        {/* Progress bar */}
        <div className="flex h-1 bg-zinc-100 w-full">
          <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
        </div>

        <div className="p-8">
          
          {/* ─── Step 1: Mode Selection + Info ─── */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Choose Your Tracking Mode</h2>
              <p className="text-zinc-650 text-sm leading-relaxed max-w-sm">
                Pick the tracking precision level for your practice session. Your camera data is processed 100% locally — never uploaded.
              </p>
              
              {/* Mode Cards */}
              <div className="w-full grid grid-cols-1 gap-3">
                {/* Head Gaze Mode */}
                <button
                  onClick={() => switchDetectionMode("head")}
                  className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 group ${
                    detectionMode === "head"
                      ? "bg-indigo-50/50 border-indigo-200 shadow-xs"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl transition ${
                      detectionMode === "head" ? "bg-indigo-100 text-indigo-600" : "bg-zinc-200 text-zinc-500"
                    }`}>
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">Head Gaze Detector</span>
                        {detectionMode === "head" && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-850 font-semibold px-1.5 py-0.5 rounded-md">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
                        Tracks your head rotation. Triggers when you turn your face away from the camera. Best for general focus monitoring.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Eye Focus Mode */}
                <button
                  onClick={() => switchDetectionMode("eye")}
                  className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 group ${
                    detectionMode === "eye"
                      ? "bg-violet-50/50 border-violet-200 shadow-xs"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl transition ${
                      detectionMode === "eye" ? "bg-violet-100 text-violet-600" : "bg-zinc-200 text-zinc-500"
                    }`}>
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">Eye Focus Detector</span>
                        {detectionMode === "eye" && (
                          <span className="text-[10px] bg-violet-100 text-violet-850 font-semibold px-1.5 py-0.5 rounded-md">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
                        Tracks your iris position. Detects when your eyes look away even if your head stays still — catches script-reading. Ideal for public speaking practice.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-zinc-100 text-zinc-700 px-4 py-3 text-sm font-semibold hover:bg-zinc-200 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToCamera}
                  className="flex-1 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-500 shadow-sm transition duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Camera Preview + Calibration ─── */}
          {step === 2 && (
            <div className="flex flex-col items-center text-center space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900">
                  {status === "calibrating" ? "Calibrating..." : "Position Your Face"}
                </h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  detectionMode === "eye"
                    ? "bg-violet-100 text-violet-750"
                    : "bg-indigo-100 text-indigo-755"
                }`}>
                  {detectionMode === "eye" ? "Eye Mode" : "Head Mode"}
                </span>
              </div>
              
              {/* Webcam Preview */}
              <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-200 shadow-inner">
                <video ref={videoRef} className="h-full w-full object-cover transform scale-x-[-1]" muted playsInline />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`h-40 w-40 rounded-full border-2 border-dashed transition-all duration-300 ${
                    status === "tracking"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : status === "calibrating"
                      ? (detectionMode === "eye" ? "border-violet-400 animate-pulse bg-violet-400/5" : "border-indigo-400 animate-pulse bg-indigo-400/5")
                      : isFaceDetected
                      ? (detectionMode === "eye" ? "border-violet-500/80 bg-violet-500/5" : "border-indigo-500/80 bg-indigo-500/5")
                      : "border-red-500/80 bg-red-500/5"
                  }`} />
                </div>

                {status === "calibrating" && (
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-3 text-left border border-zinc-200 shadow-sm">
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-100 ${detectionMode === "eye" ? "bg-violet-500" : "bg-indigo-500"}`} style={{ width: `${calibrationProgress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-zinc-550 font-mono">
                      <span>{detectionMode === "eye" ? "Calibrating iris baseline..." : "Calibrating resting pose..."}</span>
                      <span>{Math.round(calibrationProgress)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="h-12 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-650 border-t-transparent" />
                    <span>Loading face mesh models...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-650 text-sm font-medium">{error}</p>
                ) : (status === "ready" || status === "idle") && !isFaceDetected ? (
                  <p className="text-zinc-550 text-sm animate-pulse">Waiting for face detection...</p>
                ) : (status === "ready" || status === "idle") && isFaceDetected ? (
                  <p className={`text-sm font-semibold animate-pulse ${detectionMode === "eye" ? "text-violet-650" : "text-indigo-650"}`}>
                    {detectionMode === "eye" ? "Face detected! Look straight at the camera, then calibrate." : "Face aligned. Tap calibrate to lock baseline!"}
                  </p>
                ) : status === "calibrating" ? (
                  <p className="text-sm font-medium text-zinc-650">
                    {detectionMode === "eye" ? "Keep your eyes focused directly on the camera..." : "Keep looking straight at the screen..."}
                  </p>
                ) : status === "tracking" ? (
                  <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Calibration Successful!
                  </p>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl bg-zinc-100 text-zinc-700 px-4 py-3 text-sm font-semibold hover:bg-zinc-200 transition duration-200"
                >
                  Back
                </button>

                {status === "tracking" ? (
                  <button
                    onClick={() => { if (videoRef.current) onStartTracking(videoRef.current); }}
                    className="flex-1 rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-500 shadow-sm transition duration-200"
                  >
                    Start Session
                  </button>
                ) : (
                  <button
                    onClick={handleStartCalibration}
                    disabled={!isFaceDetected || isLoading}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                      isFaceDetected && !isLoading
                        ? (detectionMode === "eye"
                          ? "bg-violet-600 hover:bg-violet-500 text-white shadow-xs"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs")
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                    }`}
                  >
                    {detectionMode === "eye" ? "Calibrate Eyes" : "Calibrate Angle"}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
