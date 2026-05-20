"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Standard MediaPipe landmark indices
const LANDMARKS = {
  NOSE: 4,
  LEFT_EYE: 33,
  RIGHT_EYE: 263,
  FOREHEAD: 10,
  CHIN: 152,
};

export function useFaceTracker() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [trackingMode, setTrackingModeState] = useState("alignment");
  const [lookAwayCount, setLookAwayCount] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  // Recording & Timeline Review States
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [lookAwayEvents, setLookAwayEvents] = useState([]);

  // Real-time metrics for UI feedback
  const [currentDevX, setCurrentDevX] = useState(0);
  const [currentDevY, setCurrentDevY] = useState(0);
  const [calibrationData, setCalibrationData] = useState({
    baselineRatioX: 0.5,
    baselineRatioY: 0.45,
  });

  // Settings
  const [settings, setSettings] = useState({
    thresholdX: 0.12,
    thresholdY: 0.12,
    debounceMs: 1500,
  });

  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lookAwayTimerRef = useRef(null);
  const lookingAwayRef = useRef(false);
  const calibrationFramesRef = useRef([]);

  // Loop control refs — these allow processFrame to always read current values
  // without needing to recreate the animation loop closure
  const activeVideoRef = useRef(null);
  const trackingModeRef = useRef("alignment");
  const calibrationDataRef = useRef({ baselineRatioX: 0.5, baselineRatioY: 0.45 });
  const settingsRef = useRef({ thresholdX: 0.12, thresholdY: 0.12, debounceMs: 1500 });

  // Recording API Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const sessionStartTimeRef = useRef(0);
  const audioStreamRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    calibrationDataRef.current = calibrationData;
  }, [calibrationData]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const setTrackingMode = useCallback((mode) => {
    trackingModeRef.current = mode;
    setTrackingModeState(mode);
  }, []);

  // Load MediaPipe Face Landmarker model
  const loadModel = useCallback(async () => {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current;

    setIsLoading(true);
    setError(null);
    setStatus("loading");

    try {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });

      faceLandmarkerRef.current = landmarker;
      setStatus("ready");
      setIsLoading(false);
      return landmarker;
    } catch (err) {
      console.error("Failed to load MediaPipe Face Landmarker:", err);
      setError("Failed to load face tracking model. Check your internet connection.");
      setStatus("error");
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Request webcam stream + microphone audio
  const startCamera = useCallback(async (videoElement) => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Get video stream (used for face detection + display)
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = videoStream;

      // Get audio stream separately (so the video element stays muted for detection)
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        audioStreamRef.current = audioStream;
      } catch (audioErr) {
        console.warn("Microphone access denied or unavailable, recording without audio.", audioErr);
        audioStreamRef.current = null;
      }

      if (videoElement) {
        videoElement.srcObject = videoStream;
        videoElement.onloadedmetadata = () => {
          videoElement.play().catch((e) => console.error("Error playing video:", e));
        };
      }
      return videoStream;
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Webcam access denied. Please enable camera permissions.");
      setStatus("error");
      throw err;
    }
  }, []);

  // Calculate face ratios (Yaw/Pitch)
  const calculateFaceRatios = (landmarks) => {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftEye = landmarks[LANDMARKS.LEFT_EYE];
    const rightEye = landmarks[LANDMARKS.RIGHT_EYE];
    const forehead = landmarks[LANDMARKS.FOREHEAD];
    const chin = landmarks[LANDMARKS.CHIN];

    if (!nose || !leftEye || !rightEye || !forehead || !chin) return null;

    const distLeftX = Math.abs(nose.x - leftEye.x);
    const distRightX = Math.abs(nose.x - rightEye.x);
    const totalX = distLeftX + distRightX;
    const ratioX = totalX > 0 ? distLeftX / totalX : 0.5;

    const distTopY = Math.abs(nose.y - forehead.y);
    const distBottomY = Math.abs(nose.y - chin.y);
    const totalY = distTopY + distBottomY;
    const ratioY = totalY > 0 ? distTopY / totalY : 0.45;

    return { ratioX, ratioY };
  };

  // Calibrate user baseline
  const startCalibration = useCallback(() => {
    calibrationFramesRef.current = [];
    setStatus("calibrating");
    setTrackingMode("calibration");
  }, [setTrackingMode]);

  // ── Recording ─────────────────────────────────────────────
  // Stop any existing recorder cleanly before starting a new one
  const startRecording = useCallback(() => {
    // Kill any orphaned recorder first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.onstop = null; // prevent it from generating a stale blob
        mediaRecorderRef.current.stop();
      } catch (_) {
        /* ignore */
      }
    }

    const videoStream = activeVideoRef.current?.srcObject || streamRef.current;
    if (!videoStream || videoStream.getTracks().every((t) => t.readyState === "ended")) {
      console.warn("No active stream found to record.");
      return;
    }

    // Combine video + audio tracks into a single stream for the recorder
    const combinedStream = new MediaStream();
    videoStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }

    recordedChunksRef.current = [];
    sessionStartTimeRef.current = Date.now();

    try {
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }

      const recorder = new MediaRecorder(combinedStream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // chunk every 500ms for finer granularity
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }

      // Wait for the recorder to finish writing chunks
      const existingOnStop = recorder.onstop;
      recorder.onstop = (...args) => {
        if (existingOnStop) existingOnStop(...args);
        resolve();
      };
      recorder.stop();
    });
  }, []);

  const clearRecording = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setLookAwayEvents([]);
  }, [recordedVideoUrl]);

  // ── Stop everything ───────────────────────────────────────
  const stopTracker = useCallback(async () => {
    // 1. Stop the animation frame loop immediately
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 2. Stop the recorder and WAIT for it to finish flushing
    await stopRecording();

    // 3. Now it's safe to kill the stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (lookAwayTimerRef.current) {
      clearTimeout(lookAwayTimerRef.current);
      lookAwayTimerRef.current = null;
    }
    lookingAwayRef.current = false;
    activeVideoRef.current = null;
    setStatus("ready");
    setIsFaceDetected(false);
  }, [stopRecording]);

  // ── Detection loop ────────────────────────────────────────
  // Uses refs for all mutable state so the closure never goes stale
  const runDetectionLoop = useCallback(
    (videoElement, mode) => {
      if (!faceLandmarkerRef.current) return;

      activeVideoRef.current = videoElement;
      if (mode) {
        trackingModeRef.current = mode;
        setTrackingModeState(mode);
      }

      // Prevent duplicate animation loop
      if (animationFrameRef.current) {
        return;
      }

      const landmarker = faceLandmarkerRef.current;

      const processFrame = () => {
        const video = activeVideoRef.current;
        if (!video || video.paused || video.ended) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
          return;
        }

        // Read current mode and settings from refs (never stale)
        const currentMode = trackingModeRef.current;
        const calData = calibrationDataRef.current;
        const cfg = settingsRef.current;

        const now = performance.now();
        const results = landmarker.detectForVideo(video, now);

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          setIsFaceDetected(true);
          const landmarks = results.faceLandmarks[0];
          const ratios = calculateFaceRatios(landmarks);

          if (ratios) {
            if (currentMode === "calibration") {
              calibrationFramesRef.current.push(ratios);
              if (calibrationFramesRef.current.length >= 40) {
                const avgX =
                  calibrationFramesRef.current.reduce((a, c) => a + c.ratioX, 0) / 40;
                const avgY =
                  calibrationFramesRef.current.reduce((a, c) => a + c.ratioY, 0) / 40;

                const newCal = { baselineRatioX: avgX, baselineRatioY: avgY };
                calibrationDataRef.current = newCal; // update ref immediately
                setCalibrationData(newCal); // also update React state for UI

                setStatus("tracking");
                trackingModeRef.current = "tracking";
                setTrackingModeState("tracking");
                // NOTE: recording is NOT started here — it starts when the user
                // clicks "Start Session" on the dashboard
              }
            } else if (currentMode === "tracking") {
              const devX = Math.abs(ratios.ratioX - calData.baselineRatioX);
              const devY = Math.abs(ratios.ratioY - calData.baselineRatioY);

              setCurrentDevX(Number(devX.toFixed(4)));
              setCurrentDevY(Number(devY.toFixed(4)));

              const isLookingAway = devX > cfg.thresholdX || devY > cfg.thresholdY;

              if (isLookingAway) {
                if (!lookingAwayRef.current) {
                  lookingAwayRef.current = true;
                  setStatus("warning");
                  lookAwayTimerRef.current = setTimeout(() => {
                    setLookAwayCount((prev) => prev + 1);
                    const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
                    setLookAwayEvents((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        timestamp: elapsed,
                        type:
                          devX > cfg.thresholdX
                            ? "Horizontal shift (Yaw)"
                            : "Vertical shift (Pitch)",
                      },
                    ]);
                  }, cfg.debounceMs);
                }
              } else {
                if (lookingAwayRef.current) {
                  lookingAwayRef.current = false;
                  setStatus("tracking");
                  if (lookAwayTimerRef.current) {
                    clearTimeout(lookAwayTimerRef.current);
                    lookAwayTimerRef.current = null;
                  }
                }
              }
            } else {
              // alignment mode — just detect face presence
              setCurrentDevX(0);
              setCurrentDevY(0);
            }
          }
        } else {
          setIsFaceDetected(false);
          setCurrentDevX(0);
          setCurrentDevY(0);

          if (currentMode === "tracking") {
            if (!lookingAwayRef.current) {
              lookingAwayRef.current = true;
              setStatus("warning");
              lookAwayTimerRef.current = setTimeout(() => {
                setLookAwayCount((prev) => prev + 1);
                const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
                setLookAwayEvents((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    timestamp: elapsed,
                    type: "Face out of camera frame",
                  },
                ]);
              }, cfg.debounceMs);
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
    },
    [] // no deps — processFrame reads everything from refs
  );

  useEffect(() => {
    return () => {
      stopTracker();
    };
  }, [stopTracker]);

  return {
    isLoading,
    error,
    status,
    trackingMode,
    lookAwayCount,
    isFaceDetected,
    recordedVideoUrl,
    lookAwayEvents,
    currentDevX,
    currentDevY,
    calibrationData,
    settings,
    setSettings,
    loadModel,
    startCamera,
    startCalibration,
    startRecording,
    runDetectionLoop,
    stopTracker,
    setLookAwayCount,
    setTrackingMode,
    clearRecording,
  };
}
