"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useSpeechTracker() {
  // ── Refs (for values read inside event handlers) ────────────
  const SpeechRecognitionAPIRef = useRef(null); // resolved lazily in useEffect
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const restartTimeoutRef = useRef(null);

  // ── State (for reactive UI) ─────────────────────────────────
  // Initialize to false for SSR safety — resolved on mount via useEffect
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");

  // ── Resolve browser support on mount (no SSR mismatch) ──────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (API) {
      SpeechRecognitionAPIRef.current = API;
      setIsSupported(true);
    }
  }, []);

  // ── Start listening ─────────────────────────────────────────
  const startListening = useCallback(
    (_sessionDurationSecs = 600) => {
      const SpeechRecognitionAPI = SpeechRecognitionAPIRef.current;
      if (!SpeechRecognitionAPI) {
        setError(
          "Speech recognition is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }

      // Reset all tracking state
      transcriptRef.current = "";
      setTranscript("");
      setError(null);

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "id-ID";

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) {
              transcriptRef.current += " " + text;
            }
          }
        }

        setTranscript(transcriptRef.current.trim());
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

    const finalTranscript = transcriptRef.current.trim();
    const words = finalTranscript
      ? finalTranscript.split(/\s+/).filter((w) => w.length > 0).length
      : 0;

    return {
      transcript: finalTranscript,
      totalWordCount: words,
    };
  }, []);

  // ── Reset ───────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopListening();
    transcriptRef.current = "";
    setTranscript("");
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
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
