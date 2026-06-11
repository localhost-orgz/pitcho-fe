// ── Timeline segments (seconds on classroom.mp4) ─────────────
// Key: segment identifier, Value: { start, end } in seconds
export const TIMELINE = {
  IDLE_BLINK:   { start: 0,  end: 7  },
  COUGH:        { start: 8,  end: 10 },
  SNEEZE:       { start: 10, end: 12 },
  YAWN:         { start: 12, end: 15 },
  DROP_BOTTLE:  { start: 15, end: 17 },
};

// ── Distraction type weights (must sum to 100) ───────────────
export const DEFAULT_WEIGHTS = {
  COUGH:        45,
  SNEEZE:       25,
  YAWN:         20,
  DROP_BOTTLE:  10,
};

// ── Difficulty modifiers ──────────────────────────────────────
export const DIFFICULTY = {
  easy:   { multiplier: 0.9, maxDropBottle: 1, maxGap: 30 },
  medium: { multiplier: 1.5, maxDropBottle: 2, maxGap: 25 },
  hard:   { multiplier: 2.0, maxDropBottle: 3, maxGap: 20 },
};

// ── Timeline zone distribution (as fraction of session) ──────
export const ZONES = {
  EARLY:  { min: 0,   max: 0.2, fraction: 0.15 },
  MIDDLE: { min: 0.2, max: 0.8, fraction: 0.70 },
  LATE:   { min: 0.8, max: 1.0, fraction: 0.15 },
};

// ── Minimum gap between distractions (seconds) ────────────────
export const MIN_GAP_SECONDS = 3;

// ── Max consecutive identical distractions ────────────────────
export const MAX_CONSECUTIVE_SAME = 2;

// ── All distraction type keys (for iteration) ─────────────────
export const DISTRACTION_TYPES = Object.keys(TIMELINE).filter((k) => k !== "IDLE_BLINK");
