"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTour } from "./TourContext";
import {
  MonitorPlay,
  Upload,
  Camera,
  Settings,
  Play,
  ScanFace,
  Eye,
  ScrollText,
  StopCircle,
  Trophy,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

// ── Icon map for step definitions ─────────────────────────────
const ICON_MAP = {
  MonitorPlay,
  Upload,
  Camera,
  Settings,
  Play,
  ScanFace,
  Eye,
  ScrollText,
  StopCircle,
  Trophy,
  ChartNoAxesCombined,
};

// ── Padding around the spotlight hole ─────────────────────────
const SPOTLIGHT_PADDING = 8;

// ── Tooltip offset from the hole edge ─────────────────────────
const TOOLTIP_GAP = 16;

// ── Positioning helpers ───────────────────────────────────────
function getViewportRect() {
  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function computePosition(targetRect, preferredPosition, viewport) {
  const cardWidth = 320;
  // Use a realistic card height estimate — the actual rendered card is ~240px.
  // Using a value too small causes top-placement cards to overlap the target.
  const cardMinHeight = 240;
  const arrowSize = 10;
  const margin = 16;

  let cardTop = targetRect.bottom + TOOLTIP_GAP;
  let cardLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
  let arrowPlacement = "top";

  const fitsBelow = cardTop + cardMinHeight <= viewport.height - margin;
  const fitsAbove = targetRect.top - cardMinHeight - TOOLTIP_GAP >= margin;
  const fitsRight =
    targetRect.right + cardWidth + TOOLTIP_GAP <= viewport.width - margin;
  const fitsLeft = targetRect.left - cardWidth - TOOLTIP_GAP >= margin;

  let usePosition = preferredPosition || "bottom";

  if (usePosition === "bottom" && !fitsBelow) {
    if (fitsAbove) usePosition = "top";
    else if (fitsRight) usePosition = "right";
    else if (fitsLeft) usePosition = "left";
  } else if (usePosition === "top" && !fitsAbove) {
    if (fitsBelow) usePosition = "bottom";
    else if (fitsRight) usePosition = "right";
    else if (fitsLeft) usePosition = "left";
  } else if (usePosition === "right" && !fitsRight) {
    if (fitsBelow) usePosition = "bottom";
    else if (fitsAbove) usePosition = "top";
    else if (fitsLeft) usePosition = "left";
  } else if (usePosition === "left" && !fitsLeft) {
    if (fitsBelow) usePosition = "bottom";
    else if (fitsAbove) usePosition = "top";
    else if (fitsRight) usePosition = "right";
  }

  switch (usePosition) {
    case "bottom":
      cardTop = targetRect.bottom + TOOLTIP_GAP;
      cardLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      arrowPlacement = "top";
      break;
    case "top":
      // Card sits ABOVE the target: position its bottom edge just above the target.
      // Use a 2× gap for extra breathing room so it never overlaps the element.
      cardTop = targetRect.top - TOOLTIP_GAP * 2 - cardMinHeight;
      cardLeft = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      arrowPlacement = "bottom";
      break;
    case "right":
      cardTop = targetRect.top + targetRect.height / 2 - cardMinHeight / 2;
      cardLeft = targetRect.right + TOOLTIP_GAP;
      arrowPlacement = "left";
      break;
    case "left":
      cardTop = targetRect.top + targetRect.height / 2 - cardMinHeight / 2;
      cardLeft = targetRect.left - cardWidth - TOOLTIP_GAP;
      arrowPlacement = "right";
      break;
  }

  cardLeft = Math.max(
    margin,
    Math.min(cardLeft, viewport.width - cardWidth - margin),
  );
  if (usePosition === "top") {
    // Keep card from going above the top of the viewport
    cardTop = Math.max(margin, cardTop);
  } else if (usePosition === "bottom") {
    cardTop = Math.min(viewport.height - cardMinHeight - margin, cardTop);
  } else {
    cardTop = Math.max(
      margin,
      Math.min(cardTop, viewport.height - cardMinHeight - margin),
    );
  }

  let arrowStyle = {};
  const isTopOrBottom =
    arrowPlacement === "top" || arrowPlacement === "bottom";

  if (isTopOrBottom) {
    const arrowX = targetRect.left + targetRect.width / 2 - cardLeft;
    const clampedX = Math.max(
      arrowSize * 2,
      Math.min(arrowX, cardWidth - arrowSize * 2),
    );
    arrowStyle = { left: `${clampedX}px` };
  } else {
    const arrowY = targetRect.top + targetRect.height / 2 - cardTop;
    const clampedY = Math.max(
      arrowSize * 2,
      Math.min(arrowY, cardMinHeight - arrowSize * 2),
    );
    arrowStyle = { top: `${clampedY}px` };
  }

  return {
    cardStyle: {
      position: "fixed",
      top: `${cardTop}px`,
      left: `${cardLeft}px`,
      width: `${cardWidth}px`,
      zIndex: 100,
    },
    arrowStyle,
    arrowPlacement,
    usePosition,
  };
}

export default function TourOverlay() {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    canAdvance,
    blockingMessage,
    dismissTour,
    nextStep,
    prevStep,
    signalReady,
  } = useTour();

  const [spotlightRects, setSpotlightRects] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const [targetNotFound, setTargetNotFound] = useState(false);
  const [countdown, setCountdown] = useState(null); // seconds remaining for waitDuration
  const rafRef = useRef(null);
  const countdownRef = useRef(null);
  const scrollDoneRef = useRef(false);

  // ── Reset stale overlay state on every step change ────────────────
  // Without this, targetNotFound or old spotlight rects from the previous step
  // persist during the brief gap before the new recalc completes, which can
  // cause the wrong overlay to flash or the step to appear skipped.
  useEffect(() => {
    setTargetNotFound(false);
    setSpotlightRects(null);
    setCardPosition(null);
  }, [currentStepIndex]);

  // ── Scroll target into view when step changes ────────────────────
  useEffect(() => {
    if (!isTourActive || !currentStep) return;
    scrollDoneRef.current = false;

    // Retry loop: wait for the element to appear in the DOM after navigation
    let attempts = 0;
    const maxAttempts = 15;

    const tryScroll = () => {
      const target = document.querySelector(currentStep.targetSelector);
      if (target) {
        // Compute how far we need to scroll to center the target
        const rect = target.getBoundingClientRect();
        const targetCenterY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        const scrollOffset = targetCenterY - viewportCenterY;

        if (Math.abs(scrollOffset) > 10) {
          window.scrollBy({ top: scrollOffset, behavior: "smooth" });
        }
        scrollDoneRef.current = true;
        // Recalculate positions after scroll settles
        setTimeout(() => recalc(), 400);
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 100);
      }
    };

    // Initial delay to let navigation + DOM render
    const scrollTimer = setTimeout(tryScroll, 300);
    return () => clearTimeout(scrollTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourActive, currentStepIndex, currentStep?.targetSelector]);

  // ── Countdown timer for waitDuration steps ──────────────────
  useEffect(() => {
    if (
      !isTourActive ||
      !currentStep ||
      !currentStep.waitDuration
    ) {
      setCountdown(null);
      return;
    }

    setCountdown(currentStep.waitDuration);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          // Auto-advance after countdown
          setTimeout(() => nextStep(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [isTourActive, currentStepIndex, currentStep?.waitDuration]);

  // ── Find target and calculate positions ──────────────────────
  const recalc = useCallback(() => {
    if (!isTourActive || !currentStep) {
      setSpotlightRects(null);
      setCardPosition(null);
      return;
    }

    const target = document.querySelector(currentStep.targetSelector);
    if (!target) {
      setTargetNotFound(true);
      setSpotlightRects(null);
      setCardPosition(null);
      return;
    }

    setTargetNotFound(false);
    const rect = target.getBoundingClientRect();
    const padded = {
      top: rect.top - SPOTLIGHT_PADDING,
      right: rect.right + SPOTLIGHT_PADDING,
      bottom: rect.bottom + SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    };

    const vp = getViewportRect();

    setSpotlightRects({
      top: {
        top: 0,
        left: 0,
        width: vp.width,
        height: Math.max(0, padded.top),
      },
      bottom: {
        top: padded.bottom,
        left: 0,
        width: vp.width,
        height: Math.max(0, vp.height - padded.bottom),
      },
      left: {
        top: padded.top,
        left: 0,
        width: Math.max(0, padded.left),
        height: padded.height,
      },
      right: {
        top: padded.top,
        left: padded.right,
        width: Math.max(0, vp.width - padded.right),
        height: padded.height,
      },
    });

    const pos = computePosition(padded, currentStep.position, vp);
    setCardPosition(pos);
  }, [isTourActive, currentStep]);

  // ── Recalculate on resize / scroll ───────────────────────────
  useEffect(() => {
    if (!isTourActive) return;

    const onFrame = () => {
      recalc();
      rafRef.current = null;
    };

    const scheduleRecalc = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(onFrame);
    };

    window.addEventListener("resize", scheduleRecalc);
    window.addEventListener("scroll", scheduleRecalc, true);

    // Delay the initial recalc so the DOM has time to settle after a step
    // change or navigation — prevents premature "targetNotFound" when the
    // element is temporarily absent during a page transition.
    const initTimer = setTimeout(() => recalc(), 350);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("resize", scheduleRecalc);
      window.removeEventListener("scroll", scheduleRecalc, true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isTourActive, recalc]);

  // ── Keyboard: Escape to dismiss ─────────────────────────────
  useEffect(() => {
    if (!isTourActive) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        dismissTour();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isTourActive, dismissTour]);

  // ── Block pointer events on the backdrop while tour is active ──
  // We do NOT lock body overflow because that would prevent our own
  // programmatic scrolling (window.scrollBy) from centering tour targets.
  // Instead, the overlay panels use pointer-events:none on the spotlight hole
  // and pointer-events:auto on the dim panels to block user interaction.
  useEffect(() => {
    if (!isTourActive) return;
    // Prevent touch-based scrolling from the user (overlay panels catch it)
    const preventTouchMove = (e) => {
      // Allow scroll only if it originates from the overlay card itself
      if (e.target.closest('[data-tour-card]')) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', preventTouchMove);
  }, [isTourActive]);

  if (!isTourActive || !currentStep) return null;

  const StepIcon = ICON_MAP[currentStep.icon] || MonitorPlay;
  const isLastStep = currentStepIndex >= totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;
  const isBlocked = !canAdvance || countdown !== null;

  // ── Arrow rendering ─────────────────────────────────────────
  const arrowSize = 10;
  const arrowPlacement = cardPosition?.arrowPlacement || "top";

  const renderArrow = () => {
    const style = cardPosition?.arrowStyle || {};

    switch (arrowPlacement) {
      case "top":
        return (
          <div
            className="absolute -top-[10px] z-10"
            style={{ ...style, width: 0, height: 0 }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid white`,
                filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.06))",
              }}
            />
          </div>
        );
      case "bottom":
        return (
          <div
            className="absolute -bottom-[10px] z-10"
            style={{ ...style, width: 0, height: 0 }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid white`,
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.06))",
              }}
            />
          </div>
        );
      case "left":
        return (
          <div
            className="absolute -left-[10px] z-10"
            style={{ ...style, width: 0, height: 0 }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid white`,
                filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.06))",
              }}
            />
          </div>
        );
      case "right":
        return (
          <div
            className="absolute -right-[10px] z-10"
            style={{ ...style, width: 0, height: 0 }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderLeft: `${arrowSize}px solid white`,
                filter: "drop-shadow(1px 0 1px rgba(0,0,0,0.06))",
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* ── Spotlight overlay panels ─────────────────────────── */}
      {spotlightRects && (
        <>
          <div
            className="fixed z-[90] bg-zinc-900/60 backdrop-blur-[2px] cursor-default"
            style={{
              top: spotlightRects.top.top,
              left: spotlightRects.top.left,
              width: spotlightRects.top.width,
              height: spotlightRects.top.height,
            }}
            onWheel={(e) => e.preventDefault()}
          />
          <div
            className="fixed z-[90] bg-zinc-900/60 backdrop-blur-[2px] cursor-default"
            style={{
              top: spotlightRects.bottom.top,
              left: spotlightRects.bottom.left,
              width: spotlightRects.bottom.width,
              height: spotlightRects.bottom.height,
            }}
            onWheel={(e) => e.preventDefault()}
          />
          <div
            className="fixed z-[90] bg-zinc-900/60 backdrop-blur-[2px] cursor-default"
            style={{
              top: spotlightRects.left.top,
              left: spotlightRects.left.left,
              width: spotlightRects.left.width,
              height: spotlightRects.left.height,
            }}
            onWheel={(e) => e.preventDefault()}
          />
          <div
            className="fixed z-[90] bg-zinc-900/60 backdrop-blur-[2px] cursor-default"
            style={{
              top: spotlightRects.right.top,
              left: spotlightRects.right.left,
              width: spotlightRects.right.width,
              height: spotlightRects.right.height,
            }}
            onWheel={(e) => e.preventDefault()}
          />
          {/* Glow border around the hole */}
          <div
            className="fixed z-[91] pointer-events-none rounded-lg"
            style={{
              top:
                (spotlightRects.left.top || 0) - SPOTLIGHT_PADDING,
              left:
                (spotlightRects.left.left || 0) +
                (spotlightRects.left.width || 0) -
                SPOTLIGHT_PADDING,
              width:
                (spotlightRects.right.left || 0) -
                (spotlightRects.left.left || 0) -
                (spotlightRects.left.width || 0),
              height: spotlightRects.left.height,
              boxShadow:
                "0 0 0 4px rgba(3, 136, 255, 0.5), 0 0 20px rgba(3, 136, 255, 0.2)",
            }}
          />
        </>
      )}

      {/* ── Fallback centered card when target not found ──────── */}
      {targetNotFound && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-2xl animate-fade-in">
            <div className="p-8 flex flex-col items-center text-center space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0388ff]">
                <StepIcon size={32} />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                  {currentStep.title}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed mt-2 max-w-sm">
                  {currentStep.body}
                </p>
              </div>
              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={dismissTour}
                  className="flex-1 rounded-xl bg-zinc-100 text-zinc-700 px-4 py-3 text-sm font-semibold hover:bg-zinc-200 transition duration-200 cursor-pointer"
                >
                  Skip Tour
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 rounded-xl bg-[#0388ff] text-white px-4 py-3 text-sm font-semibold hover:bg-[#0066ff] shadow-sm transition duration-200 cursor-pointer"
                >
                  {isLastStep ? "Got it!" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tooltip card ──────────────────────────────────────── */}
      {cardPosition && !targetNotFound && (
        <div
          data-tour-card
          className="fixed rounded-2xl bg-white border border-zinc-200 shadow-2xl animate-fade-in overflow-visible"
          style={cardPosition.cardStyle}
        >
          {renderArrow()}

          <div className="p-6">
            {/* Step indicator + close */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <button
                onClick={dismissTour}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                aria-label="Close tour"
              >
                <X size={16} />
              </button>
            </div>

            {/* Icon + Text */}
            <div className="flex items-start gap-3 mb-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0388ff]">
                <StepIcon size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-zinc-900 leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mt-1.5">
                  {currentStep.body}
                </p>
              </div>
            </div>

            {/* ── Blocking message / Countdown ────────────────── */}
            {countdown !== null && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <Loader2 size={14} className="text-amber-500 animate-spin shrink-0" />
                <span className="text-xs font-bold text-amber-700">
                  {currentStep.countdownLabel || "Auto-advancing in"}{" "}
                  <span className="tabular-nums">{countdown}s</span>
                </span>
              </div>
            )}
            {isBlocked && countdown === null && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
                <span className="text-xs font-bold text-blue-700">
                  {blockingMessage || "Complete this step to continue"}
                </span>
              </div>
            )}

            {/* Dots + buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
              {/* Windowed 5-dot indicator */}
              <div className="flex gap-1.5 items-center">
                {(() => {
                  const VISIBLE = 5;
                  const half = Math.floor(VISIBLE / 2);
                  let start = Math.max(0, currentStepIndex - half);
                  let end = start + VISIBLE;
                  if (end > totalSteps) {
                    end = totalSteps;
                    start = Math.max(0, end - VISIBLE);
                  }
                  return Array.from({ length: end - start }, (_, idx) => {
                    const i = start + idx;
                    return (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === currentStepIndex
                            ? "bg-[#0388ff] w-4"
                            : "bg-zinc-200 w-2"
                        }`}
                      />
                    );
                  });
                })()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={dismissTour}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                >
                  Skip
                </button>
                {!isFirstStep && !isBlocked && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={isBlocked}
                  className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer ${
                    isBlocked
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "text-white bg-[#0388ff] hover:bg-[#0066ff]"
                  }`}
                >
                  {isLastStep
                    ? "Got it!"
                    : countdown !== null
                      ? `${countdown}s`
                      : "Next"}
                  {!isLastStep && countdown === null && (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
