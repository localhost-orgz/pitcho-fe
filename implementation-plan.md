# Implementation Plan: Session Analytics Aggregation & Overall Scoring

## Objective

Build a centralized analytics pipeline that collects all public speaking session data and transforms it into a final overall score between 0 and 100.

The system should separate:

1. Data Collection
2. Analytics Aggregation
3. Score Calculation
4. Result Presentation

This allows future scoring formulas to change without affecting tracking logic.

---

# Phase 1: Create Session Analytics Model

Create a single session analytics object that accumulates all metrics throughout the presentation.

Example:

```ts
interface SessionAnalytics {
  sessionDurationSeconds: number;

  totalWords: number;

  distractedDurationSeconds: number;

  fillerWordCount: number;

  redundantPhraseCount: number;

  averageWPM: number;
}
```

This object becomes the single source of truth for all scoring calculations.

---

# Phase 2: Collect Raw Session Data

During the presentation session, continuously collect:

## Speech Metrics

Track:

```ts
totalWords;
```

Track:

```ts
speechSegments;
```

Track:

```ts
liveTranscript;
```

These will later be used for:

- WPM calculation
- filler analysis
- redundancy analysis

---

## Focus Metrics

Track:

```ts
distractedDurationSeconds;
```

Definition:

Time spent not looking toward the camera.

Important:

Do NOT count distraction occurrences.

Only count total distracted duration.

Example:

```text
User looks away for 3 seconds
User looks away for 8 seconds
User looks away for 5 seconds

Total distracted duration = 16 seconds
```

---

# Phase 3: Generate Session Analytics

At session completion, aggregate all raw data.

Calculate:

## Average WPM

```ts
averageWPM = totalWords / (sessionDurationSeconds / 60);
```

---

## Filler Rate

Calculate:

```ts
fillerRate = (fillerWordCount / totalWords) * 100;
```

Meaning:

Number of filler words per 100 spoken words.

Examples:

```text
500 words
10 fillers

= 2 fillers per 100 words
```

---

## Redundancy Rate

Calculate:

```ts
redundancyRate = (redundantPhraseCount / totalWords) * 100;
```

Meaning:

Number of redundant phrases per 100 spoken words.

Examples:

```text
500 words
5 redundancies

= 1 redundancy per 100 words
```

---

# Phase 4: Score Calculation Engine

Create a dedicated module:

```ts
calculateSessionScore();
```

Input:

```ts
SessionAnalytics;
```

Output:

```ts
SessionScore;
```

---

# Phase 5: Focus Score

Weight:

```ts
40%
```

Formula:

```ts
focusScore = 100 - (distractedDurationSeconds / sessionDurationSeconds) * 100;
```

Clamp:

```ts
0 - 100;
```

Examples:

```text
300 second session
15 distracted seconds

= 95
```

---

# Phase 6: Pace Score

Weight:

```ts
25%
```

Rules:

```ts
120-160 WPM => 100

100-120 WPM => 85
160-180 WPM => 85

80-100 WPM => 70
180-200 WPM => 70

<80 => 50
>200 => 50
```

Implement as rule-based mapping.

Not linear interpolation.

---

# Phase 7: Filler Score

Weight:

```ts
20%
```

Use filler rate.

Rules:

```ts
0-2 => 100
3-4 => 90
5-6 => 80
7-8 => 70
>8 => 50
```

---

# Phase 8: Efficiency Score

Weight:

```ts
15%
```

Use redundancy rate.

Rules:

```ts
0-1 => 100
2-3 => 90
4-5 => 80
>5 => 70
```

---

# Phase 9: Calculate Overall Score

Formula:

```ts
overallScore =
  focusScore * 0.4 +
  paceScore * 0.25 +
  fillerScore * 0.2 +
  efficiencyScore * 0.15;
```

Round:

```ts
Math.round();
```

Return value:

```ts
0 - 100;
```

---

# Phase 10: Result DTO

Create a structured response object.

Example:

```ts
{
  overallScore: 88,

  breakdown: {
    focus: 92,
    pace: 85,
    filler: 80,
    efficiency: 95
  },

  analytics: {
    totalWords: 650,
    averageWPM: 130,
    distractedDurationSeconds: 24,
    fillerWordCount: 8,
    redundantPhraseCount: 3
  }
}
```

---

# Phase 11: Future-Proof Design

Scoring weights should not be hardcoded.

Store them in configuration:

```ts
SCORING_WEIGHTS = {
  focus: 0.4,
  pace: 0.25,
  filler: 0.2,
  efficiency: 0.15,
};
```

This allows future tuning without changing business logic.

The analytics layer must remain independent from the scoring layer.
