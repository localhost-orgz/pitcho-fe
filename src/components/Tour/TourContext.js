"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { TOUR_STEPS } from "./tourSteps";

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── Blocking state — page components can control advance ────
  const [canAdvance, setCanAdvance] = useState(true);
  const [blockingMessage, setBlockingMessage] = useState("");

  // Track whether we're in a "real" session (user actually started it)
  const isRealSessionRef = useRef(false);

  // ── On mount: check localStorage for completion ──────────────
  useEffect(() => {
    try {
      const completed = localStorage.getItem("pitcho_tour_completed");
      if (completed !== "true") {
        setIsNewUser(true);
      }
    } catch {
      setIsNewUser(true);
    }
  }, []);

  // ── Reset blocking when step changes ─────────────────────────
  useEffect(() => {
    if (!isTourActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    // If step has a blocking condition, start blocked
    if (step.blockingCondition) {
      setCanAdvance(false);
      setBlockingMessage(step.blockingMessage || "Complete this step first");
    } else {
      setCanAdvance(true);
      setBlockingMessage("");
    }
  }, [isTourActive, currentStepIndex]);

  // ── When tour is active and step changes, navigate if needed ──
  useEffect(() => {
    if (!isTourActive) return;
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    // If the user naturally navigated PAST the current step's page and landed
    // directly on the next step's page (e.g., clicking "End Session" takes them
    // to /result), auto-advance to that step instead of navigating back.
    // Only do this when the pages are actually different — if both the current
    // step and the next step share the same page, we must NOT auto-advance or
    // same-page steps will be skipped.
    const nextStep = TOUR_STEPS[currentStepIndex + 1];
    if (
      nextStep &&
      nextStep.page !== step.page &&
      pathname === nextStep.page
    ) {
      setCurrentStepIndex((prev) => prev + 1);
      return;
    }

    // Only navigate if we're on a completely different page
    if (pathname !== step.page) {
      router.push(step.page);
    }
  }, [isTourActive, currentStepIndex, pathname, router]);

  // ── Actions ──────────────────────────────────────────────────
  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourActive(true);
    setCanAdvance(true);
    setBlockingMessage("");
    isRealSessionRef.current = false;
  }, []);

  const dismissTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentStepIndex(0);
    try {
      localStorage.setItem("pitcho_tour_completed", "true");
    } catch {}
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev >= TOUR_STEPS.length - 1) {
        // Last step — complete the tour
        setIsTourActive(false);
        try {
          localStorage.setItem("pitcho_tour_completed", "true");
        } catch {}
        return 0;
      }
      return prev + 1;
    });
    // Reset blocking for next step
    setCanAdvance(true);
    setBlockingMessage("");
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
    setCanAdvance(true);
    setBlockingMessage("");
  }, []);

  const restartTour = useCallback(() => {
    try {
      localStorage.removeItem("pitcho_tour_completed");
    } catch {}
    setIsNewUser(true);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    setCanAdvance(true);
    setBlockingMessage("");
    isRealSessionRef.current = false;
  }, []);

  /** Called by page components when a blocking condition is met */
  const signalReady = useCallback((message) => {
    setCanAdvance(true);
    setBlockingMessage(message || "");
  }, []);

  /** Called by the session page when user actually starts a real session */
  const markRealSessionStarted = useCallback(() => {
    isRealSessionRef.current = true;
  }, []);

  const currentStep = TOUR_STEPS[currentStepIndex] || null;

  const value = useMemo(
    () => ({
      isTourActive,
      currentStepIndex,
      currentStep,
      totalSteps: TOUR_STEPS.length,
      isNewUser,
      canAdvance,
      blockingMessage,
      startTour,
      dismissTour,
      nextStep,
      prevStep,
      restartTour,
      signalReady,
      markRealSessionStarted,
    }),
    [
      isTourActive,
      currentStepIndex,
      currentStep,
      isNewUser,
      canAdvance,
      blockingMessage,
      startTour,
      dismissTour,
      nextStep,
      prevStep,
      restartTour,
      signalReady,
      markRealSessionStarted,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return ctx;
}

export default TourContext;
