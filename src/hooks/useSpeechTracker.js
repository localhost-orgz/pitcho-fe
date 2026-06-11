"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── WPM classification thresholds ─────────────────────────────
const WPM = {
  TOO_FAST: 150,
  SLIGHTLY_FAST: 130,
  IDEAL_MIN: 100,
};

const SEGMENT_COUNT = 5;

function classifyWpm(wpm) {
  if (wpm <= 0) return { status: "N/A", color: "slate" };
  if (wpm > WPM.TOO_FAST) return { status: "Too Fast", color: "red" };
  if (wpm >= WPM.SLIGHTLY_FAST) return { status: "Slightly Fast", color: "orange" };
  if (wpm >= WPM.IDEAL_MIN) return { status: "Ideal Pace", color: "green" };
  return { status: "Too Slow", color: "blue" };
}

function getSegmentIndex(elapsed, sessionDuration) {
  if (elapsed <= 0 || sessionDuration <= 0) return 0;
  const fraction = elapsed / sessionDuration;
  if (fraction <= 0.2) return 0;
  if (fraction <= 0.4) return 1;
  if (fraction <= 0.6) return 2;
  if (fraction <= 0.8) return 3;
  return 4;
}

const INITIAL_SEGMENTS = Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
  index: i,
  label: `${i * 20}-${(i + 1) * 20}%`,
  wpm: 0,
  status: "N/A",
  wordCount: 0,
}));

export function useSpeechTracker() {
  // ── Refs (for values read inside event handlers) ────────────
  const SpeechRecognitionAPIRef = useRef(null); // resolved lazily in useEffect
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const segmentWordCountsRef = useRef([0, 0, 0, 0, 0]);
  const sessionDurationRef = useRef(0);
  const sessionStartTimeRef = useRef(0);
  const restartTimeoutRef = useRef(null);
  const totalWordCountRef = useRef(0);

  // ── State (for reactive UI) ─────────────────────────────────
  // Initialize to false for SSR safety — resolved on mount via useEffect
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [currentWpm, setCurrentWpm] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("N/A");
  const [segmentData, setSegmentData] = useState(INITIAL_SEGMENTS);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [averageWpm, setAverageWpm] = useState(0);

  // ── Resolve browser support on mount (no SSR mismatch) ──────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (API) {
      SpeechRecognitionAPIRef.current = API;
      setIsSupported(true);
    }
  }, []);

  // ── Periodic UI refresh ─────────────────────────────────────
  const refreshLiveMetrics = useCallback(() => {
    if (!isListeningRef.current || sessionDurationRef.current <= 0) return;

    const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
    const segIdx = Math.min(
      getSegmentIndex(elapsed, sessionDurationRef.current),
      SEGMENT_COUNT - 1
    );
    const words = segmentWordCountsRef.current[segIdx];
    const segmentDuration = sessionDurationRef.current / SEGMENT_COUNT;

    // Use actual elapsed time within this segment for live accuracy
    const elapsedInSegment = Math.min(
      Math.max(elapsed - segIdx * segmentDuration, 0),
      segmentDuration
    );
    const minutesInSegment = Math.max(elapsedInSegment, 1) / 60;
    const wpm = minutesInSegment > 0 ? Math.round(words / minutesInSegment) : 0;

    setCurrentWpm(wpm);
    setCurrentStatus(classifyWpm(wpm).status);
  }, []);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(refreshLiveMetrics, 1000);
    return () => clearInterval(interval);
  }, [isListening, refreshLiveMetrics]);

  // ── Start listening ─────────────────────────────────────────
  const startListening = useCallback(
    (sessionDurationSecs = 600) => {
      const SpeechRecognitionAPI = SpeechRecognitionAPIRef.current;
      if (!SpeechRecognitionAPI) {
        setError(
          "Speech recognition is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }

      // Reset all tracking state
      sessionDurationRef.current = sessionDurationSecs;
      sessionStartTimeRef.current = Date.now();
      transcriptRef.current = "";
      segmentWordCountsRef.current = [0, 0, 0, 0, 0];
      totalWordCountRef.current = 0;
      setTranscript("");
      setTotalWordCount(0);
      setAverageWpm(0);
      setCurrentWpm(0);
      setCurrentStatus("N/A");
      setSegmentData(INITIAL_SEGMENTS);
      setError(null);

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "id-ID";

      recognition.onresult = (event) => {
        let wordsAdded = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) {
              transcriptRef.current += " " + text;
              wordsAdded += text.split(/\s+/).filter((w) => w.length > 0).length;
            }
          }
        }

        if (wordsAdded > 0) {
          const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
          const segIdx = Math.min(
            getSegmentIndex(elapsed, sessionDurationRef.current),
            SEGMENT_COUNT - 1
          );

          segmentWordCountsRef.current[segIdx] += wordsAdded;
          totalWordCountRef.current += wordsAdded;

          setTranscript(transcriptRef.current.trim());
          setTotalWordCount(totalWordCountRef.current);

          // Recalculate all segment WPMs using actual elapsed per segment
          const totalElapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
          const segmentDuration = sessionDurationRef.current / SEGMENT_COUNT;
          setSegmentData(
            Array.from({ length: SEGMENT_COUNT }, (_, i) => {
              const wordCount = segmentWordCountsRef.current[i];

              // Future segments with no words: keep WPM at 0
              if (wordCount === 0) {
                return {
                  index: i,
                  label: `${i * 20}-${(i + 1) * 20}%`,
                  wordCount: 0,
                  wpm: 0,
                  status: classifyWpm(0).status,
                };
              }

              // For completed and current segments: use actual elapsed time
              const segStartTime = i * segmentDuration;
              const elapsedInSegment = Math.min(
                Math.max(totalElapsed - segStartTime, 0),
                segmentDuration
              );
              const minutes = Math.max(elapsedInSegment, 1) / 60;
              const wpm =
                minutes > 0 ? Math.round(wordCount / minutes) : 0;

              return {
                index: i,
                label: `${i * 20}-${(i + 1) * 20}%`,
                wordCount,
                wpm,
                status: classifyWpm(wpm).status,
              };
            })
          );

          // Update overall average
          if (elapsed > 0) {
            setAverageWpm(
              Math.round(totalWordCountRef.current / (elapsed / 60))
            );
          }
        }
      };

      recognition.onerror = (event) => {
        // "no-speech" is expected during silence — ignore
        if (event.error !== "no-speech") {
          console.warn("SpeechRecognition error:", event.error);
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if session is still active
        // (SpeechRecognition stops after extended silence)
        if (isListeningRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current === recognition) {
              try {
                recognition.start();
              } catch (_) {
                // May throw if already started — safe to ignore
              }
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setError("Failed to start speech recognition.");
        return;
      }

      isListeningRef.current = true;
      setIsListening(true);
    },
    []
  );

  // ── Stop listening & return final results ──────────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {
        // Already stopped
      }
      recognitionRef.current = null;
    }

    setIsListening(false);
    setCurrentWpm(0);
    setCurrentStatus("N/A");

    const totalElapsed =
      sessionStartTimeRef.current > 0
        ? (Date.now() - sessionStartTimeRef.current) / 1000
        : 0;

    const segDuration =
      sessionDurationRef.current > 0
        ? sessionDurationRef.current / SEGMENT_COUNT
        : 0;

    const finalSegments = segmentWordCountsRef.current.map((wordCount, i) => ({
      index: i,
      label: `${i * 20}-${(i + 1) * 20}%`,
      wpm: segDuration > 0 ? Math.round(wordCount / (segDuration / 60)) : 0,
      wordCount,
      status: classifyWpm(
        segDuration > 0 ? Math.round(wordCount / (segDuration / 60)) : 0
      ).status,
    }));

    const totalWords = totalWordCountRef.current;
    const avgWpm =
      totalElapsed > 0 ? Math.round(totalWords / (totalElapsed / 60)) : 0;

    return {
      transcript: transcriptRef.current.trim(),
      totalWordCount: totalWords,
      averageWpm: avgWpm,
      speechSegments: finalSegments,
    };
  }, []);

  // ── Reset ───────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopListening();
    transcriptRef.current = "";
    segmentWordCountsRef.current = [0, 0, 0, 0, 0];
    totalWordCountRef.current = 0;
    sessionStartTimeRef.current = 0;
    sessionDurationRef.current = 0;
    setTranscript("");
    setTotalWordCount(0);
    setAverageWpm(0);
    setCurrentWpm(0);
    setCurrentStatus("N/A");
    setSegmentData(INITIAL_SEGMENTS);
    setError(null);
  }, [stopListening]);

  // ── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {
          // Already stopped
        }
        recognitionRef.current = null;
      }
      isListeningRef.current = false;
    };
  }, []);

  return {
    isListening,
    error,
    transcript,
    currentWpm,
    currentStatus,
    segmentData,
    totalWordCount,
    averageWpm,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
