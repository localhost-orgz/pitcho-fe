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
  const readyRef = useRef(false); // deduplicate onVideoReady calls

  const [isReady, setIsReady] = useState(false);
  const [currentState, setCurrentState] = useState("idle");

  // ── Safe play: handles autoplay-policy errors in production ───
  // Browsers (especially on Vercel/HTTPS) may block programmatic play()
  // even on muted videos if the element isn't yet interacted with.
  // We retry once after a short delay, which usually succeeds after the
  // browser has processed the muted+autoPlay attributes.
  const safePlay = useCallback(
    async (video) => {
      if (!video) return;
      try {
        await video.play();
      } catch (err) {
        if (err.name === "NotAllowedError" || err.name === "AbortError") {
          // Retry after a brief delay — the autoPlay attribute usually
          // unlocks play() on the next event-loop tick in production.
          await new Promise((r) => setTimeout(r, 150));
          try {
            await video.play();
          } catch (_) {
            // Silently ignore — video has autoPlay set so the browser
            // will start it on its own once media is ready.
          }
        }
      }
    },
    []
  );

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
    safePlay(video);
  }, [videoRef, safePlay]);

  // ── Play nodding once (10s → 14s) ─────────────────────────────
  const playNoddingOnce = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    stateRef.current = "nodding";
    currentSegmentRef.current = "NODDING";
    setCurrentState("nodding");

    video.currentTime = TIMELINE.NODDING.start;
    safePlay(video);
  }, [videoRef, safePlay]);

  // ── Play yawning once (15s → 19s) ─────────────────────────────
  const playYawningOnce = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    stateRef.current = "yawning";
    currentSegmentRef.current = "YAWNING";
    setCurrentState("yawning");

    video.currentTime = TIMELINE.YAWNING.start;
    safePlay(video);
  }, [videoRef, safePlay]);

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
  // Guard against being called multiple times (onLoadedData can fire
  // multiple times on Vercel due to streaming / range requests).
  const onVideoReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
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
  }, [videoRef]);

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
