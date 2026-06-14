// ── Scoring Configuration ──────────────────────────────────

export const SCORING_WEIGHTS = {
  focus: 0.4,
  pace: 0.25,
  filler: 0.2,
  efficiency: 0.15,
};

// Smooth-curve constants
const PACE_IDEAL = 140; // optimal WPM
const PACE_SIGMA = 40; // width of the Gaussian

const FILLER_DECAY = 0.35; // per-minute exponential decay
const EFFICIENCY_DECAY = 0.8; // per-100-words exponential decay

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
 * Gaussian curve centered at 140 WPM (ideal speaking speed).
 * Smooth decay — no step-function cliffs.
 *   score = 100 × exp(−0.5 × ((wpm − 140) / 40)²)
 *
 * Examples:
 *   140 WPM → 100  (peak)
 *   120 WPM → ~88
 *   100 WPM → ~61
 *    80 WPM → ~32
 *    60 WPM → ~14
 */
export function calcPaceScore(averageWpm) {
  if (averageWpm == null || averageWpm <= 0) return 0;
  const deviation = (averageWpm - PACE_IDEAL) / PACE_SIGMA;
  const raw = 100 * Math.exp(-0.5 * deviation * deviation);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Calculate Filler Score (filler word usage).
 * Weight: 20%
 *
 * Uses fillers-per-minute rate for duration proportionality.
 *   fillerRatePerMinute = fillerWordCount / (sessionDurationSeconds / 60)
 *   score = 100 × exp(−0.35 × fillerRatePerMinute)
 *
 * Falls back to word-percentage method when sessionDurationSeconds is unavailable.
 *
 * Examples (per-minute):
 *   0.0/min → 100
 *   1.0/min → ~70
 *   2.0/min → ~50
 *   3.0/min → ~35
 *   5.0/min → ~17
 */
export function calcFillerScore(fillerWordCount, totalWords, sessionDurationSeconds) {
  if (fillerWordCount == null || fillerWordCount <= 0) return 100;

  // Primary: per-minute rate (requires duration)
  if (sessionDurationSeconds != null && sessionDurationSeconds > 0) {
    const minutes = sessionDurationSeconds / 60;
    if (minutes > 0) {
      const fillerRatePerMinute = fillerWordCount / minutes;
      const raw = 100 * Math.exp(-FILLER_DECAY * fillerRatePerMinute);
      return Math.max(0, Math.min(100, Math.round(raw)));
    }
  }

  // Fallback: word-percentage based (graceful degradation)
  if (!totalWords || totalWords <= 0) return 100;
  const fillerRate = (fillerWordCount / totalWords) * 100;
  const raw = 100 * Math.exp(-0.18 * fillerRate);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Calculate Efficiency Score (redundancy / pleonasm).
 * Weight: 15%
 *
 * Uses occurrences-per-100-words rate with smooth exponential decay.
 *   redundancyPer100Words = (redundantPhraseCount / totalWords) × 100
 *   score = 100 × exp(−0.8 × redundancyPer100Words)
 *
 * Examples (per 100 words):
 *   0.0/100w → 100
 *   0.5/100w → ~67
 *   1.0/100w → ~45
 *   2.0/100w → ~20
 *   3.0/100w → ~9
 */
export function calcEfficiencyScore(redundantPhraseCount, totalWords) {
  if (!totalWords || totalWords <= 0) return 100;
  if (redundantPhraseCount == null || redundantPhraseCount <= 0) return 100;
  const redundancyPer100Words = (redundantPhraseCount / totalWords) * 100;
  const raw = 100 * Math.exp(-EFFICIENCY_DECAY * redundancyPer100Words);
  return Math.max(0, Math.min(100, Math.round(raw)));
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
  const fillerScore = calcFillerScore(
    fillerWordCount,
    totalWordCount,
    sessionDurationSeconds
  );
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
