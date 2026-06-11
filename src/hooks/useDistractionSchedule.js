"use client";

import { useState, useCallback } from "react";
import {
  DIFFICULTY,
  DEFAULT_WEIGHTS,
  ZONES,
  MIN_GAP_SECONDS,
} from "@/app/presentation/session/distractions";
import {
  distributeEvents,
  pickDistractionType,
  computeDynamicMinGap,
} from "@/lib/distractionUtils";

/**
 * Generates and stores a distraction schedule for a session.
 *
 * @returns {{ schedule: Array<{timestamp: number, type: string}>, generateSchedule: Function, clearSchedule: Function }}
 */
export function useDistractionSchedule() {
  const [schedule, setSchedule] = useState([]);

  const generateSchedule = useCallback((sessionDurationSecs, difficultyKey) => {
    const config = DIFFICULTY[difficultyKey];
    if (!config) {
      setSchedule([]);
      return [];
    }

    // Guard: session must be positive
    if (!sessionDurationSecs || sessionDurationSecs <= 0) {
      setSchedule([]);
      return [];
    }

    // 1. Compute event count
    const sessionMinutes = sessionDurationSecs / 60;
    const eventCount = Math.round(sessionMinutes * config.multiplier);
    if (eventCount === 0) {
      setSchedule([]);
      return [];
    }

    // 2. Compute dynamic minimum gap
    const minGap = computeDynamicMinGap(
      eventCount,
      sessionDurationSecs,
      MIN_GAP_SECONDS
    );

    // 3. Distribute timestamps across time zones
    const timestamps = distributeEvents(
      eventCount,
      sessionDurationSecs,
      ZONES,
      minGap,
      config.maxGap || 0
    );

    // 4. Assign types to each timestamp
    const events = [];
    const typeHistory = [];
    let dropBottleSoFar = 0;

    for (const ts of timestamps) {
      const type = pickDistractionType({
        weights: DEFAULT_WEIGHTS,
        typeHistory,
        dropBottleSoFar,
        maxDropBottle: config.maxDropBottle,
      });

      typeHistory.push(type);
      if (typeHistory.length > 3) typeHistory.shift();
      if (type === "DROP_BOTTLE") dropBottleSoFar++;

      events.push({
        timestamp: Math.round(ts * 10) / 10,
        type,
      });
    }

    setSchedule(events);
    return events;
  }, []);

  const clearSchedule = useCallback(() => {
    setSchedule([]);
  }, []);

  return { schedule, generateSchedule, clearSchedule };
}
