"use client";

import { useEffect, useRef, useState } from "react";

export default function FaceTrackerModal({
  isOpen,
  onClose,
  tracker,
  onStartTracking,
}) {
  const [step, setStep] = useState(1); // 1: Info, 2: Camera Request/Model Load, 3: Calibration
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const videoRef = useRef(null);

  const {
    isLoading,
    error,
    status,
    isFaceDetected,
    loadModel,
    startCamera,
    startCalibration,
    runDetectionLoop,
  } = tracker;

  // Handle cleanup when modal closes (without stopping stream if session is starting)
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCalibrationProgress(0);
    }
  }, [isOpen]);

  // Step 2: request permission and load model
  const handleRequestAccess = async () => {
    try {
      // 1. Load model first
      await loadModel();
      // 2. Start camera
      setStep(3);
      // Wait for React to mount the video element in step 3 before starting camera
      setTimeout(async () => {
        if (videoRef.current) {
          await startCamera(videoRef.current);
          // Start detection loop immediately in 'alignment' mode to detect face presence
          runDetectionLoop(videoRef.current, "alignment");
        }
      }, 200);
    } catch (err) {
      console.error(err);
    }
  };

  // Step 3: Trigger calibration
  const handleStartCalibration = () => {
    if (status !== "calibrating") {
      startCalibration();
    }
  };

  // Calibration progress animation
  useEffect(() => {
    if (status === "calibrating") {
      const interval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2.5; // Matches the 40-frame baseline calibration (~1.6 seconds at 25fps)
        });
      }, 40);

      return () => clearInterval(interval);
    } else {
      setCalibrationProgress(0);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl transition-all duration-300">
        
        {/* Progress header bar */}
        <div className="flex h-1 bg-zinc-800 w-full">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Content */}
        <div className="p-8">
          
          {/* Step 1: Info Screen */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Smart Face Tracking Setup</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                To help you stay focused on your screen, this feature counts how many times you look away from the camera.
              </p>
              
              <div className="w-full bg-zinc-800/40 rounded-2xl p-4 border border-zinc-800 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">1</div>
                  <p className="text-xs text-zinc-300 font-medium">Privacy First: All camera streams are processed locally in your browser. We never save or upload your video.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">2</div>
                  <p className="text-xs text-zinc-300 font-medium">Auto-Calibration: We calibrate to your rest position, so standard blinks or small movements won't penalize you.</p>
                </div>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-semibold hover:bg-zinc-700 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAccess}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition duration-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Calibration & Camera Feed */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-zinc-100">
                {status === "calibrating" ? "Calibrating Gaze..." : "Position Your Face"}
              </h2>
              
              {/* Webcam Preview Container */}
              <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-inner">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover transform scale-x-[-1]"
                  muted
                  playsInline
                />
                
                {/* Calibration circular guides */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`h-40 w-40 rounded-full border-2 border-dashed transition-all duration-300 ${
                    status === "tracking"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : status === "calibrating"
                      ? "border-indigo-400 animate-pulse bg-indigo-400/5"
                      : isFaceDetected
                      ? "border-indigo-500/80 bg-indigo-500/5"
                      : "border-red-500/80 bg-red-500/5"
                  }`} />
                </div>

                {/* Tracking Dev Status details inside preview for debugging */}
                {status === "calibrating" && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2 text-left border border-white/5">
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-100" 
                        style={{ width: `${calibrationProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-zinc-400 font-mono">
                      <span>Calibrating resting pose...</span>
                      <span>{Math.round(calibrationProgress)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="h-12 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <span>Loading face mesh models...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                ) : (status === "ready" || status === "idle") && !isFaceDetected ? (
                  <p className="text-zinc-400 text-sm animate-pulse">Waiting for face detection...</p>
                ) : (status === "ready" || status === "idle") && isFaceDetected ? (
                  <p className="text-indigo-400 text-sm font-semibold animate-pulse">Face aligned. Tap calibrate to lock baseline!</p>
                ) : status === "calibrating" ? (
                  <p className="text-indigo-300 text-sm font-medium">Keep looking straight at the screen...</p>
                ) : status === "tracking" ? (
                  <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
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
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm font-semibold hover:bg-zinc-700 transition duration-200"
                >
                  Back
                </button>

                {status === "tracking" ? (
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        onStartTracking(videoRef.current);
                      }
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition duration-200"
                  >
                    Start Session
                  </button>
                ) : (
                  <button
                    onClick={handleStartCalibration}
                    disabled={!isFaceDetected || isLoading}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                      isFaceDetected && !isLoading
                        ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                    }`}
                  >
                    Calibrate Angle
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
