"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Interview video timeline (public/interview.mp4)
const TIMELINE = {
  IDLE_BLINK: { start: 0, end: 9 },
  NODDING: { start: 10, end: 14 },
  YAWNING: { start: 15, end: 19 },
};

/**
 * Manages the interview video state machine.
 *
 * States:
 *   "idle"    — looping the IDLE_BLINK segment (0s → 9s)
 *   "nodding" — playing NODDING once (10s → 14s), then back to idle
 *   "yawning" — playing YAWNING once (15s → 19s), then back to idle
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 */
export function useInterviewVideoController(videoRef) {
  const stateRef = useRef("idle");
  const currentSegmentRef = useRef("IDLE_BLINK");

  const [isReady, setIsReady] = useState(false);
  const [currentState, setCurrentState] = useState("idle");

  // ── Play idle loop (0s → 9s looping) ──────────────────────────
  const playIdleLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const alreadyInIdleSegment =
      stateRef.current === "idle" &&
      video.currentTime >= TIMELINE.IDLE_BLINK.start &&
      video.currentTime < TIMELINE.IDLE_BLINK.end;

    stateRef.current = "idle";
    currentSegmentRef.current = "IDLE_BLINK";
    setCurrentState("idle");

    // Only seek if necessary — prevents flicker on redundant calls
    if (!alreadyInIdleSegment || video.paused) {
      video.currentTime = TIMELINE.IDLE_BLINK.start;
    }
    video.play().catch(() => {});
  }, [videoRef]);

  // ── Play nodding once (10s → 14s) ─────────────────────────────
  const playNoddingOnce = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    stateRef.current = "nodding";
    currentSegmentRef.current = "NODDING";
    setCurrentState("nodding");

    video.currentTime = TIMELINE.NODDING.start;
    video.play().catch(() => {});
  }, [videoRef]);

  // ── Play yawning once (15s → 19s) ─────────────────────────────
  const playYawningOnce = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    stateRef.current = "yawning";
    currentSegmentRef.current = "YAWNING";
    setCurrentState("yawning");

    video.currentTime = TIMELINE.YAWNING.start;
    video.play().catch(() => {});
  }, [videoRef]);

  // ── Handle timeupdate ─────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const seg = TIMELINE[currentSegmentRef.current];
    if (!seg) return;

    if (stateRef.current === "idle") {
      // Idle loop: restart when we hit/pass the end
      if (time >= seg.end) {
        video.currentTime = seg.start;
      }
    } else {
      // One-shot segment (nodding or yawning): when done, return to idle
      if (time >= seg.end) {
        playIdleLoop();
      }
    }
  }, [videoRef, playIdleLoop]);

  // ── Video ready handler ───────────────────────────────────────
  const onVideoReady = useCallback(() => {
    setIsReady(true);
    playIdleLoop();
  }, [playIdleLoop]);

  // ── Stop everything ───────────────────────────────────────────
  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    stateRef.current = "idle";
    currentSegmentRef.current = "IDLE_BLINK";
    setCurrentState("idle");
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isReady,
    currentState,
    onVideoReady,
    playIdleLoop,
    playNoddingOnce,
    playYawningOnce,
    handleTimeUpdate,
    stopVideo,
    TIMELINE, // export for external use if needed
  };
}
