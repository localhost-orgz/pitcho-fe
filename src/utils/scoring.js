// ── Scoring Configuration ──────────────────────────────────

export const SCORING_WEIGHTS = {
  focus: 0.4,
  pace: 0.25,
  filler: 0.2,
  efficiency: 0.15,
};

const PACE_RULES = [
  { min: 120, max: 160, score: 100 },
  { min: 100, max: 120, score: 85 },
  { min: 160, max: 180, score: 85 },
  { min: 80, max: 100, score: 70 },
  { min: 180, max: 200, score: 70 },
];

const FILLER_RATE_RULES = [
  { min: 0, max: 2, score: 100 },
  { min: 3, max: 4, score: 90 },
  { min: 5, max: 6, score: 80 },
  { min: 7, max: 8, score: 70 },
];

const EFFICIENCY_RATE_RULES = [
  { min: 0, max: 1, score: 100 },
  { min: 2, max: 3, score: 90 },
  { min: 4, max: 5, score: 80 },
];

// ── Individual Score Functions ──────────────────────────────

/**
 * Calculate Focus Score (eye contact / distraction).
 * Weight: 40%
 *
 * Formula: 100 - (distractedDurationSeconds / sessionDurationSeconds) * 100
 * Clamped to 0–100.
 */
export function calcFocusScore(distractedDurationSeconds, sessionDurationSeconds) {
  if (!sessionDurationSeconds || sessionDurationSeconds <= 0) return 0;
  const raw =
    100 - (distractedDurationSeconds / sessionDurationSeconds) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Calculate Pace Score (speaking speed).
 * Weight: 25%
 *
 * Rule-based mapping:
 *   120–160 WPM → 100
 *   100–120 or 160–180 → 85
 *   80–100 or 180–200 → 70
 *   <80 or >200 → 50
 */
export function calcPaceScore(averageWpm) {
  if (averageWpm == null || averageWpm <= 0) return 0;
  for (const rule of PACE_RULES) {
    if (averageWpm >= rule.min && averageWpm <= rule.max) {
      return rule.score;
    }
  }
  return 50; // <80 or >=200
}

/**
 * Calculate Filler Score (filler word usage).
 * Weight: 20%
 *
 * Uses filler rate = (fillerWordCount / totalWords) * 100.
 * Rules:
 *   0–2 → 100
 *   3–4 → 90
 *   5–6 → 80
 *   7–8 → 70
 *   >8 → 50
 */
export function calcFillerScore(fillerWordCount, totalWords) {
  if (!totalWords || totalWords <= 0) return 100;
  const fillerRate = (fillerWordCount / totalWords) * 100;
  for (const rule of FILLER_RATE_RULES) {
    if (fillerRate >= rule.min && fillerRate <= rule.max) {
      return rule.score;
    }
  }
  return 50; // >8
}

/**
 * Calculate Efficiency Score (redundancy / pleonasm).
 * Weight: 15%
 *
 * Uses redundancy rate = (redundantPhraseCount / totalWords) * 100.
 * Rules:
 *   0–1 → 100
 *   2–3 → 90
 *   4–5 → 80
 *   >5 → 70
 */
export function calcEfficiencyScore(redundantPhraseCount, totalWords) {
  if (!totalWords || totalWords <= 0) return 100;
  const redundancyRate = (redundantPhraseCount / totalWords) * 100;
  for (const rule of EFFICIENCY_RATE_RULES) {
    if (redundancyRate >= rule.min && redundancyRate <= rule.max) {
      return rule.score;
    }
  }
  return 70; // >5
}

// ── Orchestrator ────────────────────────────────────────────

/**
 * Calculate the complete session score from raw session and analysis data.
 *
 * @param {Object|null} sessionData  – data from localStorage "pitcho_session_data"
 * @param {Object|null} analysisData – data from localStorage "pitcho_speech_analysis"
 * @returns {{ overallScore: number, breakdown: { focus: number, pace: number, filler: number, efficiency: number }, analytics: object }}
 */
export function calculateSessionScore(sessionData, analysisData) {
  // ── Extract inputs with safe defaults ──
  const sessionDurationSeconds = sessionData?.sessionDuration ?? 0;
  const totalWordCount = sessionData?.totalWordCount ?? 0;
  const averageWpm = sessionData?.averageWpm ?? 0;
  const distractedDurationSeconds = sessionData?.totalDistractedTime ?? 0;

  // Analysis data may be null if speech analysis wasn't performed
  const fillerWordCount =
    analysisData?.analysis?.filler_words?.total_filler_count ?? 0;
  const redundantPhraseCount =
    analysisData?.analysis?.word_efficiency?.findings?.length ?? 0;

  // ── Calculate sub-scores ──
  const focusScore = calcFocusScore(
    distractedDurationSeconds,
    sessionDurationSeconds
  );
  const paceScore = calcPaceScore(averageWpm);
  const fillerScore = calcFillerScore(fillerWordCount, totalWordCount);
  const efficiencyScore = calcEfficiencyScore(
    redundantPhraseCount,
    totalWordCount
  );

  // ── Weighted overall ──
  const overallScore = Math.round(
    focusScore * SCORING_WEIGHTS.focus +
      paceScore * SCORING_WEIGHTS.pace +
      fillerScore * SCORING_WEIGHTS.filler +
      efficiencyScore * SCORING_WEIGHTS.efficiency
  );

  return {
    overallScore,
    breakdown: {
      focus: focusScore,
      pace: paceScore,
      filler: fillerScore,
      efficiency: efficiencyScore,
    },
    analytics: {
      totalWords: totalWordCount,
      averageWPM: averageWpm,
      sessionDurationSeconds,
      distractedDurationSeconds,
      fillerWordCount,
      redundantPhraseCount,
    },
  };
}
