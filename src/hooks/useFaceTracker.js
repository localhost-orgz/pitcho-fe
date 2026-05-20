"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── MediaPipe landmark indices ──────────────────────────────
const LANDMARKS = {
  NOSE: 4,
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  FOREHEAD: 10,
  CHIN: 152,
  // Iris centres (available when face landmarker outputs 478 points)
  LEFT_IRIS: 468,
  RIGHT_IRIS: 473,
  // Eyelid vertical anchors
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
};

// Default settings per detection mode
const DEFAULT_SETTINGS = {
  head: { thresholdX: 0.12, thresholdY: 0.12, debounceMs: 1500 },
  eye:  { thresholdX: 0.07, thresholdY: 0.08, debounceMs: 1200 },
};

export function useFaceTracker() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [trackingMode, setTrackingModeState] = useState("alignment");
  const [detectionMode, setDetectionMode] = useState("head"); // 'head' | 'eye'
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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS.head);

  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lookAwayTimerRef = useRef(null);
  const lookingAwayRef = useRef(false);
  const calibrationFramesRef = useRef([]);

  // Loop control refs
  const activeVideoRef = useRef(null);
  const trackingModeRef = useRef("alignment");
  const detectionModeRef = useRef("head");
  const calibrationDataRef = useRef({ baselineRatioX: 0.5, baselineRatioY: 0.45 });
  const settingsRef = useRef(DEFAULT_SETTINGS.head);

  // Recording API Refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const sessionStartTimeRef = useRef(0);
  const audioStreamRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { calibrationDataRef.current = calibrationData; }, [calibrationData]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { detectionModeRef.current = detectionMode; }, [detectionMode]);

  const setTrackingMode = useCallback((mode) => {
    trackingModeRef.current = mode;
    setTrackingModeState(mode);
  }, []);

  // Switch detection mode and apply matching default settings
  const switchDetectionMode = useCallback((mode) => {
    setDetectionMode(mode);
    detectionModeRef.current = mode;
    setSettings(DEFAULT_SETTINGS[mode]);
    settingsRef.current = DEFAULT_SETTINGS[mode];
  }, []);

  // ── Model ─────────────────────────────────────────────────
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

  // ── Camera ────────────────────────────────────────────────
  const startCamera = useCallback(async (videoElement) => {
    setError(null);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach((t) => t.stop());

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = videoStream;

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        audioStreamRef.current = audioStream;
      } catch (audioErr) {
        console.warn("Microphone unavailable, recording without audio.", audioErr);
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

  // ── Ratio calculations ────────────────────────────────────
  // HEAD mode: nose position relative to eye corners (yaw/pitch)
  const calculateHeadRatios = (landmarks) => {
    const nose = landmarks[LANDMARKS.NOSE];
    const leftEye = landmarks[LANDMARKS.LEFT_EYE_OUTER];
    const rightEye = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
    const forehead = landmarks[LANDMARKS.FOREHEAD];
    const chin = landmarks[LANDMARKS.CHIN];
    if (!nose || !leftEye || !rightEye || !forehead || !chin) return null;

    const dLX = Math.abs(nose.x - leftEye.x);
    const dRX = Math.abs(nose.x - rightEye.x);
    const tX = dLX + dRX;
    const ratioX = tX > 0 ? dLX / tX : 0.5;

    const dTY = Math.abs(nose.y - forehead.y);
    const dBY = Math.abs(nose.y - chin.y);
    const tY = dTY + dBY;
    const ratioY = tY > 0 ? dTY / tY : 0.45;

    return { ratioX, ratioY };
  };

  // EYE mode: iris centre relative to eye corner span
  const calculateIrisRatios = (landmarks) => {
    const lIris = landmarks[LANDMARKS.LEFT_IRIS];
    const rIris = landmarks[LANDMARKS.RIGHT_IRIS];
    const lOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER];
    const lInner = landmarks[LANDMARKS.LEFT_EYE_INNER];
    const rInner = landmarks[LANDMARKS.RIGHT_EYE_INNER];
    const rOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
    const lTop = landmarks[LANDMARKS.LEFT_EYE_TOP];
    const lBot = landmarks[LANDMARKS.LEFT_EYE_BOTTOM];
    const rTop = landmarks[LANDMARKS.RIGHT_EYE_TOP];
    const rBot = landmarks[LANDMARKS.RIGHT_EYE_BOTTOM];

    if (!lIris || !rIris || !lOuter || !lInner || !rOuter || !rInner ||
        !lTop || !lBot || !rTop || !rBot) return null;

    // Horizontal: where does iris sit between inner and outer corners?
    const lSpanX = lInner.x - lOuter.x;
    const lPosX  = lIris.x - lOuter.x;
    const lRatioX = lSpanX !== 0 ? lPosX / lSpanX : 0.5;

    const rSpanX = rOuter.x - rInner.x;
    const rPosX  = rIris.x - rInner.x;
    const rRatioX = rSpanX !== 0 ? rPosX / rSpanX : 0.5;

    // Vertical: where does iris sit between top and bottom eyelid?
    const lSpanY = lBot.y - lTop.y;
    const lPosY  = lIris.y - lTop.y;
    const lRatioY = lSpanY !== 0 ? lPosY / lSpanY : 0.5;

    const rSpanY = rBot.y - rTop.y;
    const rPosY  = rIris.y - rTop.y;
    const rRatioY = rSpanY !== 0 ? rPosY / rSpanY : 0.5;

    // Average both eyes for stability
    return {
      ratioX: (lRatioX + rRatioX) / 2,
      ratioY: (lRatioY + rRatioY) / 2,
    };
  };

  // Dispatcher: pick the right calculator based on detection mode
  const computeRatios = (landmarks, mode) => {
    return mode === "eye" ? calculateIrisRatios(landmarks) : calculateHeadRatios(landmarks);
  };

  // ── Calibration ───────────────────────────────────────────
  const startCalibration = useCallback(() => {
    calibrationFramesRef.current = [];
    setStatus("calibrating");
    setTrackingMode("calibration");
  }, [setTrackingMode]);

  // ── Recording ─────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch (_) { /* ignore */ }
    }

    const videoStream = activeVideoRef.current?.srcObject || streamRef.current;
    if (!videoStream || videoStream.getTracks().every((t) => t.readyState === "ended")) {
      console.warn("No active stream found to record.");
      return;
    }

    const combinedStream = new MediaStream();
    videoStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
    }

    recordedChunksRef.current = [];
    sessionStartTimeRef.current = Date.now();

    try {
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType))
        options = { mimeType: "video/webm;codecs=vp8,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType))
        options = { mimeType: "video/webm" };

      const recorder = new MediaRecorder(combinedStream, options);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
          setRecordedVideoUrl(URL.createObjectURL(blob));
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(500);
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const rec = mediaRecorderRef.current;
      if (!rec || rec.state === "inactive") { resolve(); return; }
      const existing = rec.onstop;
      rec.onstop = (...a) => { if (existing) existing(...a); resolve(); };
      rec.stop();
    });
  }, []);

  const clearRecording = useCallback(() => {
    if (recordedVideoUrl) { URL.revokeObjectURL(recordedVideoUrl); setRecordedVideoUrl(null); }
    setLookAwayEvents([]);
  }, [recordedVideoUrl]);

  // ── Stop everything ───────────────────────────────────────
  const stopTracker = useCallback(async () => {
    if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
    await stopRecording();
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
    if (lookAwayTimerRef.current) { clearTimeout(lookAwayTimerRef.current); lookAwayTimerRef.current = null; }
    lookingAwayRef.current = false;
    activeVideoRef.current = null;
    setStatus("ready");
    setIsFaceDetected(false);
  }, [stopRecording]);

  // ── Detection loop ────────────────────────────────────────
  const runDetectionLoop = useCallback((videoElement, mode) => {
    if (!faceLandmarkerRef.current) return;
    activeVideoRef.current = videoElement;
    if (mode) { trackingModeRef.current = mode; setTrackingModeState(mode); }
    if (animationFrameRef.current) return;

    const landmarker = faceLandmarkerRef.current;

    const processFrame = () => {
      const video = activeVideoRef.current;
      if (!video || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const currentMode = trackingModeRef.current;
      const dMode = detectionModeRef.current;
      const calData = calibrationDataRef.current;
      const cfg = settingsRef.current;

      const now = performance.now();
      const results = landmarker.detectForVideo(video, now);

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        setIsFaceDetected(true);
        const landmarks = results.faceLandmarks[0];
        const ratios = computeRatios(landmarks, dMode);

        if (ratios) {
          if (currentMode === "calibration") {
            calibrationFramesRef.current.push(ratios);
            if (calibrationFramesRef.current.length >= 40) {
              const avgX = calibrationFramesRef.current.reduce((a, c) => a + c.ratioX, 0) / 40;
              const avgY = calibrationFramesRef.current.reduce((a, c) => a + c.ratioY, 0) / 40;
              const newCal = { baselineRatioX: avgX, baselineRatioY: avgY };
              calibrationDataRef.current = newCal;
              setCalibrationData(newCal);
              setStatus("tracking");
              trackingModeRef.current = "tracking";
              setTrackingModeState("tracking");
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
                  setLookAwayCount((p) => p + 1);
                  const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
                  const label = dMode === "eye"
                    ? (devX > cfg.thresholdX ? "Eyes shifted horizontally" : "Eyes shifted vertically")
                    : (devX > cfg.thresholdX ? "Head turned (Yaw)" : "Head tilted (Pitch)");
                  setLookAwayEvents((p) => [...p, { id: Date.now(), timestamp: elapsed, type: label }]);
                }, cfg.debounceMs);
              }
            } else {
              if (lookingAwayRef.current) {
                lookingAwayRef.current = false;
                setStatus("tracking");
                if (lookAwayTimerRef.current) { clearTimeout(lookAwayTimerRef.current); lookAwayTimerRef.current = null; }
              }
            }
          } else {
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
              setLookAwayCount((p) => p + 1);
              const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
              setLookAwayEvents((p) => [...p, { id: Date.now(), timestamp: elapsed, type: "Face out of camera frame" }]);
            }, cfg.debounceMs);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  }, []);

  useEffect(() => { return () => { stopTracker(); }; }, [stopTracker]);

  return {
    isLoading, error, status, trackingMode, detectionMode,
    lookAwayCount, isFaceDetected, recordedVideoUrl, lookAwayEvents,
    currentDevX, currentDevY, calibrationData, settings,
    setSettings, loadModel, startCamera, startCalibration,
    startRecording, runDetectionLoop, stopTracker,
    setLookAwayCount, setTrackingMode, clearRecording,
    switchDetectionMode,
  };
}
