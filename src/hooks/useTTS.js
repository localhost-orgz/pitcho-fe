"use client";

/**
 * @file useTTS.js — React hook for ElevenLabs Text-to-Speech with browser fallback
 *
 * This hook orchestrates TTS for the interview session:
 *
 *   1. Pre-generates audio for ALL questions as soon as they load
 *      (runs in parallel during the calibration phase).
 *   2. Plays each question's pre-generated audio when its turn comes,
 *      with zero network latency.
 *   3. Falls back to browser SpeechSynthesis if ElevenLabs is
 *      unavailable for any reason.
 *   4. Cleans up blob URLs and cancels in-progress requests on unmount.
 *
 * Usage:
 *   const tts = useTTS();
 *
 *   // Step 1: Pre-generate when questions load
 *   useEffect(() => {
 *     if (questions.length > 0) tts.preGenerateAll(questions);
 *   }, [questions]);
 *
 *   // Step 2: Play a specific question
 *   await tts.play(questionText, questionId);
 *
 * @returns {Object} TTS controller with state and actions
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  getCachedSpeechUrl,
  playBlobUrl,
  preGenerateQuestions,
  clearAudioCache,
} from "@/lib/elevenlabs";

// ── Browser SpeechSynthesis fallback ───────────────────────────

/**
 * The existing browser TTS code, extracted here as a fallback.
 * This is identical to the original implementation in the interview
 * session page — it searches for an Indonesian male voice and reads
 * the text aloud using the Web Speech API.
 */

/** @type {SpeechSynthesisVoice[]|null} */
let ttsVoicesCache = null;

/**
 * Find the best available Indonesian voice, preferring male voices.
 * Caches the voice list on first call for performance.
 *
 * @returns {SpeechSynthesisVoice|null}
 */
function getIndonesianMaleVoice() {
  if (!window.speechSynthesis) return null;

  if (!ttsVoicesCache) {
    ttsVoicesCache = window.speechSynthesis.getVoices();
  }

  // Prefer a male-sounding Indonesian voice
  const maleVoice = ttsVoicesCache.find(
    (v) =>
      v.lang.startsWith("id") &&
      (v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("pria") ||
        v.name.toLowerCase().includes("damar") ||
        v.name.toLowerCase().includes("arif"))
  );
  if (maleVoice) return maleVoice;

  // Fallback: any Indonesian voice (even if female)
  return ttsVoicesCache.find((v) => v.lang.startsWith("id")) || null;
}

/**
 * Speak text using the browser's built-in SpeechSynthesis API.
 * This is the fallback when ElevenLabs is unavailable.
 *
 * @param {string} text - The text to speak
 * @returns {Promise<void>} Resolves when speech ends or on error
 */
function speakTextFallback(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      resolve();
      return;
    }

    // Cancel any currently-playing utterance to avoid overlap
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

// ── Hook ───────────────────────────────────────────────────────

/**
 * React hook providing ElevenLabs TTS with automatic browser fallback.
 *
 * State exposed:
 *   - isPlaying: true while audio is actively playing
 *   - isPreGenerating: true while background pre-generation is running
 *   - preGenerationProgress: { done: number, total: number }
 *   - error: string|null — non-fatal error message (TTS still works via fallback)
 *   - fallbackActive: true if the browser SpeechSynthesis fallback is in use
 *
 * Actions:
 *   - preGenerateAll(questions): Start background pre-generation
 *   - play(text, questionId): Play audio for a question
 *   - stop(): Cancel any ongoing playback
 *   - isCached(questionId): Check if a question's audio is ready
 */
export function useTTS() {
  // ── State ─────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreGenerating, setIsPreGenerating] = useState(false);
  const [preGenerationProgress, setPreGenerationProgress] = useState({
    done: 0,
    total: 0,
  });
  const [error, setError] = useState(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  // ── Refs (not state — avoids re-renders on cache mutations) ─
  /** @type {React.MutableRefObject<Map<string|number, string|null>>} */
  const blobUrlMapRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Initialize and cleanup ─────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Pre-load browser voices so the cache is warm if we need to fallback
    const loadVoices = () => {
      ttsVoicesCache = window.speechSynthesis
        ? window.speechSynthesis.getVoices()
        : [];
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      mountedRef.current = false;

      // Stop any in-progress browser TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }

      // Cancel any in-flight pre-generation requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Revoke all cached blob URLs to prevent memory leaks
      clearAudioCache();
      blobUrlMapRef.current.clear();
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────

  /**
   * Pre-generate audio for all questions in the background.
   *
   * Call this once when questions are loaded from sessionStorage.
   * Generation happens sequentially with a small stagger to avoid
   * ElevenLabs Voice Library race conditions. Runs during the
   * calibration phase so audio is ready before question 1.
   *
   * If a previous pre-generation is still running, it is aborted
   * before starting the new batch.
   *
   * @param {Array<Object>} questions - Question objects with id and text
   */
  const preGenerateAll = useCallback(async (questions) => {
    if (!questions || questions.length === 0) return;

    // Cancel any in-progress pre-generation (e.g., if questions changed)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!mountedRef.current) return;
    setIsPreGenerating(true);
    setPreGenerationProgress({ done: 0, total: questions.length });
    setError(null);

    // Normalise question objects to { id, text } shape for the service
    const questionItems = questions.map((q, idx) => ({
      id: q.id != null ? q.id : idx,
      text: q.question || q.title || "",
    }));

    try {
      const results = await preGenerateQuestions(questionItems, {
        signal: abortControllerRef.current.signal,
      });

      if (!mountedRef.current) return;

      // Merge results into our local map
      blobUrlMapRef.current = results;
      setPreGenerationProgress({ done: results.size, total: questions.length });

      // Count failures for logging
      let failureCount = 0;
      results.forEach((v) => {
        if (!v) failureCount++;
      });
      if (failureCount > 0) {
        console.warn(
          `[useTTS] ${failureCount}/${questions.length} questions failed to pre-generate. ` +
            `Fallback will be used for those questions.`
        );
      }
    } catch (err) {
      // AbortError is expected when intentionally cancelling — not an issue
      if (err.name === "AbortError") return;

      console.warn("[useTTS] Pre-generation batch failed:", err);

      if (mountedRef.current) {
        setError(
          "Some questions could not be pre-generated. Fallback will be used."
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsPreGenerating(false);
      }
    }
  }, []);

  /**
   * Play TTS audio for a single question.
   *
   * Priority order:
   *   1. Pre-generated blob URL (from preGenerateAll) — instant playback
   *   2. On-demand generation via getCachedSpeechUrl — small network delay
   *   3. Browser SpeechSynthesis fallback — always available
   *
   * @param {string} questionText - The text to speak aloud
   * @param {string|number} [questionId] - ID to look up in the pre-generated map.
   *   If omitted, falls through to on-demand generation using the text itself.
   * @returns {Promise<void>}
   */
  const play = useCallback(async (questionText, questionId) => {
    if (!questionText) return;

    if (!mountedRef.current) return;
    setIsPlaying(true);
    setError(null);

    try {
      // 1. Try the pre-generated blob URL first
      const cacheKey = questionId != null ? questionId : questionText;
      let blobUrl = blobUrlMapRef.current.get(cacheKey);

      // 2. If not pre-generated, attempt on-demand generation
      //    This handles the case where pre-generation was not done
      //    or failed for this specific question.
      if (!blobUrl) {
        const result = await getCachedSpeechUrl(questionText);
        if (result) {
          blobUrl = result.blobUrl;
          // Add to our map so subsequent calls use the cache
          blobUrlMapRef.current.set(cacheKey, blobUrl);
        }
      }

      if (blobUrl) {
        // Play the high-quality ElevenLabs audio.
        // If playback is blocked (e.g., autoplay policy after async gap)
        // or errors, we throw so the catch block falls back to SpeechSynthesis.
        if (mountedRef.current) setFallbackActive(false);
        const played = await playBlobUrl(blobUrl);
        if (!played) {
          throw new Error("ElevenLabs audio playback was blocked or errored");
        }
      } else {
        // No audio was generated — use browser fallback
        throw new Error("No ElevenLabs audio available for this question");
      }
    } catch (err) {
      // ElevenLabs failed — gracefully degrade to browser SpeechSynthesis.
      // The user still hears the question; the experience is just slightly
      // lower quality.
      console.warn(
        "[useTTS] Falling back to browser SpeechSynthesis:",
        err.message
      );

      if (mountedRef.current) {
        setFallbackActive(true);
        setError("Using browser speech synthesis (ElevenLabs unavailable)");
      }

      await speakTextFallback(questionText);
    } finally {
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, []);

  /**
   * Stop any currently-playing TTS audio.
   *
   * Cancels browser SpeechSynthesis immediately. For ElevenLabs
   * blob URL playback via HTMLAudioElement, the `play()` promise
   * will resolve when its turn comes (since we don't expose the
   * Audio element reference for direct control).
   */
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  /**
   * Check whether a question's audio has been pre-generated and cached.
   * Useful for showing a "ready" indicator in the question list UI.
   *
   * @param {string|number} questionId
   * @returns {boolean}
   */
  const isCached = useCallback((questionId) => {
    return blobUrlMapRef.current.has(questionId);
  }, []);

  // ── Return public API ──────────────────────────────────────
  return {
    // State (for UI rendering)
    isPlaying,
    isPreGenerating,
    preGenerationProgress,
    error,
    fallbackActive,

    // Actions
    preGenerateAll,
    play,
    stop,
    isCached,
  };
}
