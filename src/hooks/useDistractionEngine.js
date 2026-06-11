"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";

/**
 * Session runtime orchestrator.
 *
 * On every elapsed-second tick, it checks the distraction schedule
 * and triggers the video controller when an event's timestamp is
 * reached. Only fires when the video is in "idle" state to prevent
 * overlapping distractions.
 *
 * @param {object} params
 * @param {boolean} params.sessionRunning - Whether the session is active
 * @param {number} params.elapsed - Current elapsed seconds (from useSessionTimer)
 * @param {Array<{timestamp: number, type: string}>} params.schedule - Distraction schedule
 * @param {(type: string) => void} params.playDistraction - Video controller's playDistraction
 * @param {string} params.currentVideoState - Current video state ("idle" | type)
 */
export function useDistractionEngine({
  sessionRunning,
  elapsed,
  schedule,
  playDistraction,
  currentVideoState,
}) {
  // Which schedule indices have already been triggered
  const triggeredRef = useRef(new Set());
  // Previous sessionRunning to detect start/stop transitions
  const wasRunningRef = useRef(false);

  // Reset triggered set when a new schedule is generated or session restarts
  useEffect(() => {
    if (sessionRunning) {
      triggeredRef.current = new Set();
    }
  }, [schedule, sessionRunning]);

  // Detect session start: video just began playing, ensure the
  // triggered set is fresh
  useEffect(() => {
    if (sessionRunning && !wasRunningRef.current) {
      triggeredRef.current = new Set();
    }
    wasRunningRef.current = sessionRunning;
  }, [sessionRunning]);

  // ── Core trigger loop ───────────────────────────────────────
  useEffect(() => {
    if (!sessionRunning || !schedule || schedule.length === 0) return;

    // Only trigger when the video is idle
    if (currentVideoState !== "idle") return;

    // Find the first un-triggered event whose timestamp has been reached
    for (let i = 0; i < schedule.length; i++) {
      if (triggeredRef.current.has(i)) continue;

      if (elapsed >= schedule[i].timestamp) {
        triggeredRef.current.add(i);
        playDistraction(schedule[i].type);
        break; // At most one distraction per tick
      }
    }
  }, [elapsed, sessionRunning, schedule, playDistraction, currentVideoState]);

  // ── Next upcoming event (for UI countdown) ─────────────────
  const nextEvent = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;
    for (let i = 0; i < schedule.length; i++) {
      if (triggeredRef.current.has(i)) continue;
      if (schedule[i].timestamp > elapsed) {
        return {
          index: i,
          timestamp: schedule[i].timestamp,
          type: schedule[i].type,
          secondsUntil: Math.max(0, Math.round(schedule[i].timestamp - elapsed)),
        };
      }
    }
    return null; // All events triggered
  }, [elapsed, schedule]);

  // ── Exposed reset for manual cleanup ────────────────────────
  const resetEngine = useCallback(() => {
    triggeredRef.current = new Set();
  }, []);

  return { resetEngine, nextEvent };
}
