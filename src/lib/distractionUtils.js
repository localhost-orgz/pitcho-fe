import {
  DISTRACTION_TYPES,
  DEFAULT_WEIGHTS,
  MAX_CONSECUTIVE_SAME,
  MIN_GAP_SECONDS,
} from "@/app/presentation/session/distractions";

/**
 * Pick a random item from a weighted map.
 * Weights are relative (e.g., { COUGH: 45, SNEEZE: 25 }).
 * Returns the key or null if the pool is empty.
 */
export function weightedRandom(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let rand = Math.random() * total;

  for (const [key, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

/**
 * Pick a distraction type obeying constraints:
 * - max consecutive identical types
 * - max DROP_BOTTLE cap (per difficulty level)
 *
 * @param {object} weights - Weight map (key → weight)
 * @param {string[]} typeHistory - Most recent type keys (newest last)
 * @param {number} maxDropBottle - Maximum DROP_BOTTLE events allowed
 * @param {number} dropBottleSoFar - How many DROP_BOTTLE already assigned
 * @param {number} maxConsecutive - How many identical types allowed in a row
 * @returns {string} Selected type key
 */
export function pickDistractionType({
  weights = DEFAULT_WEIGHTS,
  typeHistory = [],
  dropBottleSoFar = 0,
  maxDropBottle = Infinity,
  maxConsecutive = MAX_CONSECUTIVE_SAME,
} = {}) {
  // Clone the weights so we can mutate
  const pool = { ...weights };

  // 1. Enforce DROP_BOTTLE cap
  if (dropBottleSoFar >= maxDropBottle) {
    delete pool.DROP_BOTTLE;
  }

  // 2. Enforce max consecutive — block the type present at the tail
  //    if the last N entries are all that same type
  if (typeHistory.length >= maxConsecutive) {
    const tail = typeHistory.slice(-maxConsecutive);
    const allSame = tail.every((t) => t === tail[0]);
    if (allSame && tail[0] !== undefined) {
      delete pool[tail[0]];
    }
  }

  // 3. Fallback: if pool is empty (all types blocked), relax the
  //    consecutive constraint but still enforce drop bottle cap
  const effectivePool =
    Object.keys(pool).length > 0
      ? pool
      : { ...weights, ...(dropBottleSoFar >= maxDropBottle ? { DROP_BOTTLE: 0 } : {}) };

  const pick = weightedRandom(effectivePool);
  return pick || DISTRACTION_TYPES[0]; // ultimate fallback
}

/**
 * Distribute N events across session time zones with random intra-zone
 * spacing and a minimum gap between consecutive events.
 *
 * @param {number} eventCount - Number of events to distribute
 * @param {number} sessionDurationSecs - Total session length in seconds
 * @param {object} zones - Zone definitions { min, max, fraction }
 * @param {number} minGapSecs - Minimum seconds between events
 * @returns {number[]} Sorted array of timestamps in seconds
 */
export function distributeEvents(
  eventCount,
  sessionDurationSecs,
  zones,
  minGapSecs = MIN_GAP_SECONDS
) {
  if (eventCount <= 0 || sessionDurationSecs <= 0) return [];

  // 1. Allocate raw counts per zone
  const zoneKeys = Object.keys(zones);
  const rawCounts = zoneKeys.map((key) =>
    Math.round(eventCount * zones[key].fraction)
  );

  // 2. Adjust to ensure total equals eventCount
  let sum = rawCounts.reduce((a, b) => a + b, 0);
  let diff = eventCount - sum;
  let idx = rawCounts.length - 1;
  while (diff !== 0 && idx >= 0) {
    rawCounts[idx] += diff > 0 ? 1 : -1;
    rawCounts[idx] = Math.max(0, rawCounts[idx]);
    diff = eventCount - rawCounts.reduce((a, b) => a + b, 0);
    idx--;
  }

  // 3. Generate timestamps per zone
  const allTimestamps = [];

  for (let z = 0; z < zoneKeys.length; z++) {
    const zone = zones[zoneKeys[z]];
    const count = rawCounts[z];
    if (count <= 0) continue;

    const zoneStart = zone.min * sessionDurationSecs;
    const zoneEnd = zone.max * sessionDurationSecs;
    const zoneRange = zoneEnd - zoneStart;

    // Use dynamic min gap within zone
    const effectiveMinGap = Math.min(minGapSecs, zoneRange / (count + 1));

    const timestamps = [];
    for (let i = 0; i < count; i++) {
      let placed = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        const t = zoneStart + Math.random() * zoneRange;
        const tooClose = timestamps.some(
          (existing) => Math.abs(existing - t) < effectiveMinGap
        );
        if (!tooClose) {
          timestamps.push(t);
          placed = true;
          break;
        }
      }
      // Fallback: evenly space within the zone
      if (!placed) {
        const evenSpacing = zoneRange / (count + 1);
        timestamps.push(zoneStart + (i + 1) * evenSpacing);
      }
    }
    allTimestamps.push(...timestamps);
  }

  // 4. Sort globally
  allTimestamps.sort((a, b) => a - b);

  // 5. Final pass: enforce global min gap
  for (let i = 1; i < allTimestamps.length; i++) {
    const gap = allTimestamps[i] - allTimestamps[i - 1];
    if (gap < minGapSecs) {
      allTimestamps[i] = allTimestamps[i - 1] + minGapSecs;
    }
  }

  return allTimestamps;
}

/**
 * Compute a dynamic minimum gap that scales with event density.
 * For sparse events (few events over long duration), the min gap
 * is larger to avoid clustering. For dense schedules, it tightens
 * to the absolute minimum.
 *
 * @param {number} eventCount - Number of events
 * @param {number} sessionDurationSecs - Session length in seconds
 * @param {number} absoluteMin - Hard minimum gap in seconds
 * @returns {number} Dynamic minimum gap in seconds
 */
export function computeDynamicMinGap(
  eventCount,
  sessionDurationSecs,
  absoluteMin = MIN_GAP_SECONDS
) {
  if (eventCount <= 1) return absoluteMin;
  const avgGap = sessionDurationSecs / eventCount;
  // dynamicMinGap is 30% of the average gap, never less than absoluteMin
  const dynamicGap = avgGap * 0.3;
  return Math.max(absoluteMin, Math.round(dynamicGap * 10) / 10);
}
