"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TIMELINE } from "@/app/presentation/session/distractions";

/**
 * Manages the classroom video state machine.
 *
 * States:
 *   "idle" — looping the IDLE_BLINK segment (0s → 7s)
 *   "COUGH" / "SNEEZE" / "YAWN" / "DROP_BOTTLE" — playing a distraction
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef - Ref to the <video> element
 */
export function useVideoController(videoRef) {
  // ── Refs (values needed in timeupdate callbacks) ─────────────
  const stateRef = useRef("idle");
  const currentSegmentRef = useRef("IDLE_BLINK");

  // ── State (UI-reactive, used by DistractionEngine) ──────────
  const [isReady, setIsReady] = useState(false);
  const [currentState, setCurrentState] = useState("idle");

  // ── Play idle loop (0s → 7s looping) ────────────────────────
  const playIdleLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    stateRef.current = "idle";
    currentSegmentRef.current = "IDLE_BLINK";
    setCurrentState("idle");

    if (video.currentTime < TIMELINE.IDLE_BLINK.start || video.currentTime >= TIMELINE.IDLE_BLINK.end) {
      video.currentTime = TIMELINE.IDLE_BLINK.start;
    }
    video.play().catch(() => {});
  }, [videoRef]);

  // ── Play a distraction segment ──────────────────────────────
  const playDistraction = useCallback(
    (type) => {
      const video = videoRef.current;
      if (!video || !TIMELINE[type]) return;

      stateRef.current = type;
      currentSegmentRef.current = type;
      setCurrentState(type);

      video.currentTime = TIMELINE[type].start;
      video.play().catch(() => {});
    },
    [videoRef]
  );

  // ── Handle timeupdate from the <video> element ──────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const seg = TIMELINE[currentSegmentRef.current];
    if (!seg) return;

    if (stateRef.current === "idle") {
      // Idle loop: restart when we hit or pass the end boundary
      if (time >= seg.end) {
        video.currentTime = seg.start;
      }
    } else {
      // Distraction playing: when we reach the end, return to idle
      if (time >= seg.end) {
        playIdleLoop();
      }
    }
  }, [videoRef, playIdleLoop]);

  // ── Video ready handler (called from onLoadedData) ──────────
  const onVideoReady = useCallback(() => {
    setIsReady(true);
    playIdleLoop();
  }, [playIdleLoop]);

  // ── Stop everything ─────────────────────────────────────────
  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    stateRef.current = "idle";
    currentSegmentRef.current = "IDLE_BLINK";
    setCurrentState("idle");
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────
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
    playDistraction,
    handleTimeUpdate,
    stopVideo,
  };
}
