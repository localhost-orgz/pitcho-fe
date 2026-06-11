# Badge System — Backend Implementation Guide

> **Audience:** Backend developers building the Pitcho API.
> **Frontend repo:** `pitcho-fe` (Next.js 16, currently localStorage-only, no auth).
> **Status:** Badge definitions and UI are built static. This guide covers what the backend needs to provide to make the system dynamic.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Frontend (pitcho-fe)                 │
│                                                     │
│  Session → Analytics → POST /api/badges/evaluate    │
│                                                     │
│  GET /api/users/:id/badges  ← badge state          │
│  GET /api/users/:id/progress ← progress data        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                 Backend (pitcho-be)                  │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ session_     │  │ badge_       │  │ user_      │ │
│  │ history      │  │ definitions  │  │ badges     │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  1. Receive session analytics                       │
│  2. Store session record                            │
│  3. Build evaluation context                        │
│  4. Evaluate all badge rules                        │
│  5. Unlock newly earned badges                      │
│  6. Return unlocked badges to frontend              │
└─────────────────────────────────────────────────────┘
```

**Key decisions:**

- Badge definitions live on the **backend** (single source of truth). The frontend has a static copy for UI rendering only.
- Badge evaluation runs on the **backend** after every completed session.
- The frontend calls one endpoint after session completion to trigger evaluation.

---

## 2. Database Schema

### 2.1 `session_history`

Stores every completed practice session. This is the source data for all badge conditions.

```sql
CREATE TABLE session_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),

  -- Session metadata
  mode          VARCHAR(20) NOT NULL,  -- 'presentation' | 'interview'
  duration      INT NOT NULL,          -- session duration in seconds
  started_at    TIMESTAMPTZ NOT NULL,

  -- Scoring (0–100)
  overall_score INT NOT NULL,
  focus_score   INT NOT NULL,
  pace_score    INT NOT NULL,
  filler_score  INT NOT NULL,
  efficiency_score INT NOT NULL,

  -- Raw analytics
  total_words           INT DEFAULT 0,
  average_wpm           INT DEFAULT 0,
  distracted_duration_s INT DEFAULT 0,   -- total distracted seconds
  filler_word_count     INT DEFAULT 0,
  redundant_phrase_count INT DEFAULT 0,

  -- Context
  distraction_level VARCHAR(10),          -- 'none' | 'low' | 'medium' | 'hard'
  interview_type    VARCHAR(20),          -- 'behavioral' | 'technical' | 'situational' (interview only)

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_session_history_user ON session_history(user_id);
CREATE INDEX idx_session_history_date ON session_history(user_id, started_at);
```

### 2.2 `badge_definitions` (seed table)

A reference table for badge metadata. Seed once, rarely updated.

```sql
CREATE TABLE badge_definitions (
  id          VARCHAR(50) PRIMARY KEY,   -- e.g. 'first-step', 'laser-focus'
  name        VARCHAR(100) NOT NULL,     -- display name
  description TEXT NOT NULL,             -- short description shown in UI
  icon        VARCHAR(50) NOT NULL,      -- lucide-react icon name
  category    VARCHAR(30) NOT NULL,      -- consistency|focus|fluency|pace|presentation|interview|improvement|elite
  level       INT NOT NULL DEFAULT 1,    -- displayed as "Level X"
  color       VARCHAR(20) NOT NULL,      -- 'green' | 'orange' | 'purple' | 'gray'

  -- Rule definition (see §3)
  rule_type   VARCHAR(30) NOT NULL,      -- 'threshold' | 'streak' | 'count' | 'improvement' | 'composite'
  rule_config JSONB NOT NULL,            -- see §4 for shape per rule_type

  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 `user_badges`

Tracks which badges each user has unlocked.

```sql
CREATE TABLE user_badges (
  user_id     UUID NOT NULL REFERENCES users(id),
  badge_id    VARCHAR(50) NOT NULL REFERENCES badge_definitions(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (user_id, badge_id)
);
```

---

## 3. Badge Evaluation Context

Before evaluating badges, the backend builds a **context object** from the user's session history. This context is passed to every badge rule.

```json
{
  "totalSessions": 42,
  "consecutiveDays": 7,
  "sessionHistory": [
    /* array of all sessions, newest first */
  ],
  "currentSession": {
    /* the session just completed */
  },
  "previousSession": {
    /* session before current, or null */
  },
  "unlockedBadges": {
    "first-step": "2026-03-10T...",
    "on-a-roll": "2026-03-14T..."
  },

  "presentationCount": 28,
  "interviewCount": 14,
  "presentationsOfDuration": { "1": 12, "5": 8, "15": 3 },

  "sessionsWithFocusAbove": { "80": 25, "90": 8, "95": 2 },
  "sessionsWithPaceAbove": { "85": 20, "90": 12 },
  "sessionsWithFillerBelow": { "3": 10, "5": 22 },

  "previousScore": 65
}
```

### How to compute the context

| Field                        | Computation                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `totalSessions`              | `SELECT COUNT(*) FROM session_history WHERE user_id = $1`                                      |
| `consecutiveDays`            | Walk `started_at` dates backward from today, counting consecutive days with at least 1 session |
| `sessionHistory`             | `SELECT * FROM session_history WHERE user_id = $1 ORDER BY started_at DESC`                    |
| `currentSession`             | The session record just inserted (or passed in the request body)                               |
| `previousSession`            | Second row from the ordered history query                                                      |
| `presentationCount`          | `COUNT(*) WHERE mode = 'presentation'`                                                         |
| `interviewCount`             | `COUNT(*) WHERE mode = 'interview'`                                                            |
| `presentationsOfDuration`    | Group presentation sessions by rounded duration bucket (1min=±30s, 5min=±30s, 15min=±30s)      |
| `sessionsWithFocusAbove(N)`  | `COUNT(*) WHERE focus_score > N`                                                               |
| `sessionsWithPaceAbove(N)`   | `COUNT(*) WHERE pace_score > N`                                                                |
| `sessionsWithFillerBelow(N)` | `COUNT(*) WHERE filler_score > (100 - N*10)` — see filler rate logic below                     |

### Consecutive days algorithm (pseudocode)

```
sorted_dates = SELECT DISTINCT DATE(started_at) FROM session_history
                WHERE user_id = $1 ORDER BY DATE(started_at) DESC

streak = 0
today = CURRENT_DATE

for each date in sorted_dates:
  expected = today - streak days
  if date == expected:
    streak++
  else if date < expected:
    break   // gap in streak

return streak
```

---

## 4. All 29 Badges — Unlock Conditions

### 4.1 Consistency (green)

| Badge          | ID               | Rule   | Condition               |
| -------------- | ---------------- | ------ | ----------------------- |
| First Step     | `first-step`     | count  | `totalSessions >= 1`    |
| On a Roll      | `on-a-roll`      | streak | `consecutiveDays >= 3`  |
| Weekly Warrior | `weekly-warrior` | streak | `consecutiveDays >= 7`  |
| Unstoppable    | `unstoppable`    | streak | `consecutiveDays >= 30` |

### 4.2 Focus (green)

| Badge           | ID                | Rule      | Condition                                                                                        |
| --------------- | ----------------- | --------- | ------------------------------------------------------------------------------------------------ |
| Focused Speaker | `focused-speaker` | threshold | Current session: `(distracted_duration_s / duration) * 100 < 10`                                 |
| Laser Focus     | `laser-focus`     | threshold | Current session: `(distracted_duration_s / duration) * 100 < 5`                                  |
| Iron Mind       | `iron-mind`       | threshold | Current session: `(distracted_duration_s / duration) * 100 < 2`                                  |
| Unshakeable     | `unshakeable`     | composite | Current session: `distraction_level = 'hard'` AND `(distracted_duration_s / duration) * 100 < 3` |

### 4.3 Fluency (orange)

| Badge          | ID               | Rule      | Condition                                                                            |
| -------------- | ---------------- | --------- | ------------------------------------------------------------------------------------ |
| Smooth Talker  | `smooth-talker`  | threshold | Current session: `total_words > 0` AND `(filler_word_count / total_words) * 100 < 5` |
| Fluent Speaker | `fluent-speaker` | threshold | Current session: `total_words > 0` AND `(filler_word_count / total_words) * 100 < 3` |
| Crystal Clear  | `crystal-clear`  | threshold | Current session: `total_words > 0` AND `(filler_word_count / total_words) * 100 < 1` |

### 4.4 Pace (orange)

| Badge             | ID                  | Rule   | Condition                                                  |
| ----------------- | ------------------- | ------ | ---------------------------------------------------------- |
| Perfect Pace      | `perfect-pace`      | streak | Last 3 sessions ALL have `average_wpm BETWEEN 120 AND 160` |
| Consistent Rhythm | `consistent-rhythm` | count  | `sessionsWithPaceAbove(90) >= 5`                           |

### 4.5 Presentation (green)

| Badge              | ID                   | Rule  | Condition                             |
| ------------------ | -------------------- | ----- | ------------------------------------- |
| 1-Minute Speaker   | `1min-speaker`       | count | `presentationsOfDuration['1'] >= 1`   |
| 5-Minute Speaker   | `5min-speaker`       | count | `presentationsOfDuration['5'] >= 1`   |
| 15-Minute Speaker  | `15min-speaker`      | count | `presentationsOfDuration['15'] >= 1`  |
| Marathon Presenter | `marathon-presenter` | count | `presentationsOfDuration['15'] >= 10` |

**Duration bucket logic:**

- 1-minute = duration 30–90 seconds
- 5-minute = duration 240–360 seconds
- 15-minute = duration 840–960 seconds (14–16 min)

### 4.6 Interview (purple)

| Badge                | ID                     | Rule      | Condition                                                 |
| -------------------- | ---------------------- | --------- | --------------------------------------------------------- |
| First Interview      | `first-interview`      | count     | `interviewCount >= 1`                                     |
| Job Seeker           | `job-seeker`           | count     | `interviewCount >= 10`                                    |
| Technical Challenger | `technical-challenger` | filter    | Any interview session with `interview_type = 'technical'` |
| HR Ready             | `hr-ready`             | threshold | Any behavioral interview with `overall_score > 85`        |
| Case Solver          | `case-solver`          | threshold | Any situational interview with `overall_score > 85`       |

### 4.7 Improvement (orange)

| Badge          | ID               | Rule        | Condition                                                                                               |
| -------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Getting Better | `getting-better` | improvement | `previousSession` exists AND `currentSession.overallScore - previousSession.overallScore >= 10`         |
| Breakthrough   | `breakthrough`   | improvement | `previousSession` exists AND `currentSession.overallScore - previousSession.overallScore >= 20`         |
| Comeback       | `comeback`       | improvement | `previousSession` exists AND `previousSession.overallScore < 60` AND `currentSession.overallScore > 80` |

### 4.8 Elite (purple)

| Badge                | ID                     | Rule      | Condition                                                                                                   |
| -------------------- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| Presentation Master  | `presentation-master`  | composite | Any 15-min presentation with `overall_score > 90`                                                           |
| Interview Master     | `interview-master`     | threshold | Any interview session with `overall_score > 90`                                                             |
| Distraction Master   | `distraction-master`   | composite | Any hard-mode session with `focus_score > 95`                                                               |
| Communication Expert | `communication-expert` | composite | Current session: ALL of `focus_score > 90`, `pace_score > 90`, `filler_score > 90`, `efficiency_score > 90` |

---

## 5. Scoring Formula (for context)

The backend can either receive scores from the frontend or compute them from raw analytics. The frontend currently computes scores using these formulas in `src/utils/scoring.js`:

### 5.1 Focus Score (weight 40%)

```
distracted_pct = (distracted_duration_s / duration) * 100
focus_score = MAX(0, MIN(100, 100 - distracted_pct))
```

### 5.2 Pace Score (weight 25%)

| WPM Range          | Score |
| ------------------ | ----- |
| 120–160            | 100   |
| 100–120 or 160–180 | 85    |
| 80–100 or 180–200  | 70    |
| <80 or >200        | 50    |

### 5.3 Filler Score (weight 20%)

| Filler rate (per 100 words) | Score |
| --------------------------- | ----- |
| 0–2                         | 100   |
| 3–4                         | 90    |
| 5–6                         | 80    |
| 7–8                         | 70    |
| >8                          | 50    |

### 5.4 Efficiency Score (weight 15%)

| Redundancy rate (per 100 words) | Score |
| ------------------------------- | ----- |
| 0–1                             | 100   |
| 2–3                             | 90    |
| 4–5                             | 80    |
| >5                              | 70    |

### 5.5 Overall Score

```
overall = ROUND(
  focus_score * 0.40 +
  pace_score * 0.25 +
  filler_score * 0.20 +
  efficiency_score * 0.15
)
```

---

## 6. API Endpoints

### 6.1 POST `/api/sessions`

Called by the frontend after a session ends. The request body includes the raw analytics + computed scores.

**Request:**

```json
{
  "mode": "presentation",
  "duration": 300,
  "distractionLevel": "medium",
  "interviewType": null,

  "scores": {
    "overall": 78,
    "focus": 82,
    "pace": 85,
    "filler": 70,
    "efficiency": 75
  },

  "analytics": {
    "totalWords": 450,
    "averageWpm": 135,
    "distractedDurationSeconds": 24,
    "fillerWordCount": 18,
    "redundantPhraseCount": 3
  }
}
```

**Response:**

```json
{
  "session": {
    "id": "uuid",
    "createdAt": "2026-06-12T10:30:00Z"
  },
  "newlyUnlockedBadges": [
    {
      "id": "first-step",
      "name": "First Step",
      "description": "Complete your very first practice session",
      "icon": "Footprints",
      "category": "consistency",
      "level": 1,
      "color": "green"
    }
  ]
}
```

**Backend logic on this endpoint:**

1. Validate the request
2. Insert row into `session_history`
3. Build the evaluation context (see §3)
4. Run badge evaluation (see §7)
5. Return any newly unlocked badges

### 6.2 GET `/api/users/:userId/badges`

Returns all badges with unlock status and progress.

**Response:**

```json
{
  "badges": [
    {
      "id": "first-step",
      "name": "First Step",
      "description": "Complete your very first practice session",
      "icon": "Footprints",
      "category": "consistency",
      "level": 1,
      "color": "green",
      "unlocked": true,
      "unlockedAt": "2026-03-10T14:22:00Z",
      "progress": null
    },
    {
      "id": "weekly-warrior",
      "name": "Weekly Warrior",
      "description": "Practice 7 consecutive days",
      "icon": "CalendarCheck",
      "category": "consistency",
      "level": 3,
      "color": "green",
      "unlocked": false,
      "unlockedAt": null,
      "progress": {
        "current": 4,
        "target": 7
      }
    }
  ],
  "stats": {
    "totalBadges": 29,
    "unlockedCount": 8,
    "byCategory": {
      "consistency": { "total": 4, "unlocked": 1 },
      "focus": { "total": 4, "unlocked": 1 },
      "fluency": { "total": 3, "unlocked": 1 },
      "pace": { "total": 2, "unlocked": 0 },
      "presentation": { "total": 4, "unlocked": 2 },
      "interview": { "total": 5, "unlocked": 1 },
      "improvement": { "total": 3, "unlocked": 1 },
      "elite": { "total": 4, "unlocked": 0 }
    }
  }
}
```

**Backend logic:**

1. Load all `badge_definitions`
2. Load user's `user_badges` joined with `badge_definitions`
3. For each locked badge, compute progress by running its rule against the evaluation context
4. Return the combined list + summary stats

### 6.3 GET `/api/users/:userId/progress`

Returns aggregated progress data for the progress dashboard.

**Response:**

```json
{
  "summary": {
    "overallScore": 78,
    "grade": "B",
    "totalSessions": 42,
    "totalPracticeMinutes": 1260,
    "firstSessionDate": "2026-03-10T14:22:00Z"
  },
  "streak": {
    "current": 7,
    "best": 14
  },
  "skills": {
    "focus": {
      "current": 82,
      "trend": [70, 72, 75, 78, 80, 81, 80, 82, 83, 82]
    },
    "pace": {
      "current": 85,
      "trend": [80, 82, 83, 85, 84, 86, 85, 87, 85, 85]
    },
    "filler": {
      "current": 70,
      "trend": [60, 62, 65, 68, 67, 70, 69, 71, 70, 70]
    },
    "efficiency": {
      "current": 75,
      "trend": [70, 71, 73, 74, 75, 76, 74, 75, 76, 75]
    }
  },
  "sessions": [
    /* session history array, newest first */
  ],
  "badges": [
    /* same structure as GET /badges */
  ]
}
```

---

## 7. Badge Evaluation Flow (detailed)

```
POST /api/sessions
  │
  ├─ 1. INSERT INTO session_history (user_id, mode, duration, scores, analytics...)
  │
  ├─ 2. Build evaluation context
  │     ├─ Query all sessions for user
  │     ├─ Compute consecutiveDays streak
  │     ├─ Compute mode counts
  │     ├─ Compute duration buckets
  │     ├─ Compute skill threshold counts
  │     └─ Load existing user_badges
  │
  ├─ 3. For each badge_definition (that user doesn't already have):
  │     ├─ Evaluate rule against context
  │     ├─ If condition passes → add to new_unlocks list
  │     └─ If condition fails → compute progress for frontend display
  │
  ├─ 4. INSERT INTO user_badges (user_id, badge_id) for each new unlock
  │
  └─ 5. Return response with newlyUnlockedBadges[]
```

### Rule evaluation pseudocode

```python
def evaluate_badge(badge_def, ctx):
    if badge_def['id'] in ctx['unlockedBadges']:
        return None  # already unlocked

    rule_type = badge_def['rule_type']
    config = badge_def['rule_config']

    if rule_type == 'count':
        field = config['field']        # e.g. 'totalSessions'
        threshold = config['threshold']
        return ctx[field] >= threshold

    elif rule_type == 'streak':
        field = config['field']        # e.g. 'consecutiveDays'
        threshold = config['threshold']
        return ctx[field] >= threshold

    elif rule_type == 'threshold':
        session = ctx['currentSession']
        metric = config['metric']      # e.g. 'focus_score'
        operator = config['operator']  # '>' | '<'
        value = config['value']
        if operator == '>':
            return session[metric] > value
        else:
            return session[metric] < value

    elif rule_type == 'improvement':
        if not ctx['previousSession']:
            return False
        delta = ctx['currentSession']['overall_score'] - ctx['previousSession']['overall_score']
        return delta >= config['min_delta']

    elif rule_type == 'composite':
        # Custom logic per badge — implement as stored function or code branch
        return evaluate_composite(badge_def['id'], ctx)
```

---

## 8. Progress Computation

For locked badges, the frontend shows a progress indicator (e.g. "4 / 7"). The backend computes progress by evaluating the same rule but returning a `{current, target}` pair instead of a boolean.

| Rule Type     | Progress `current`                                              | Progress `target` |
| ------------- | --------------------------------------------------------------- | ----------------- |
| `count`       | `MIN(ctx[field], threshold)`                                    | `threshold`       |
| `streak`      | `MIN(ctx[field], threshold)`                                    | `threshold`       |
| `threshold`   | Scaled value 0–100 based on distance from threshold             | `100`             |
| `improvement` | `MIN(MAX(0, delta), min_delta)`                                 | `min_delta`       |
| `composite`   | Varies per badge — see `badgeDefinitions.js` for exact formulas | badge-specific    |

---

## 9. Implementation Sequence (recommended)

### Phase 1 — Core tables + session storage

1. Create `session_history` table
2. Create `badge_definitions` table and seed all 29 badges
3. Create `user_badges` table
4. Implement `POST /api/sessions` — store session, return OK (no badge eval yet)

### Phase 2 — Badge evaluation

5. Build the evaluation context builder
6. Implement rule evaluation for all 6 rule types
7. Wire evaluation into `POST /api/sessions`
8. Return `newlyUnlockedBadges` in the response

### Phase 3 — Badge + progress endpoints

9. Implement `GET /api/users/:userId/badges` with progress
10. Implement `GET /api/users/:userId/progress` with aggregated data

### Phase 4 — Frontend integration

11. Replace localStorage session storage with API calls
12. Replace mock badge data with API responses
13. Show unlock overlay when `newlyUnlockedBadges` is non-empty
14. Wire progress-v2 page to `GET /progress` endpoint

---

## 10. Edge Cases & Notes

### No previous session

- Improvement badges (`getting-better`, `breakthrough`, `comeback`) require a `previousSession`. On the user's first-ever session, `previousSession` is `null` → these badges should not evaluate, and progress should show "0 / N".

### Session without speech analysis

- If the external speech analysis API fails, `filler_word_count` and `redundant_phrase_count` will be 0.
- Filler/efficiency scores default to 100 (perfect) when there's no data — this is intentional to avoid penalizing users for API failures.
- Badges dependent on filler data (`smooth-talker`, etc.) should still evaluate — 0 fillers / N words = 0% rate = qualifies.

### Multiple sessions in one day

- The consecutive-days streak counts unique calendar dates, not individual sessions.
- If a user does 3 sessions on Monday and 1 on Tuesday, that's a 2-day streak, not 4.

### Interview type tracking

- Currently, the frontend doesn't track `interview_type` (behavioral/technical/situational). This needs to be added to the interview setup flow before badges like `technical-challenger`, `hr-ready`, and `case-solver` can be earned.
- Until then, these badges won't unlock — that's OK, the conditions just won't match.

### Badge idempotency

- `user_badges` has a composite primary key `(user_id, badge_id)` — attempting to insert the same badge twice is a no-op.
- The evaluation always filters out already-unlocked badges before checking conditions.

### Duration bucket tolerance

- The `presentationsOfDuration` helper should use generous tolerances:
  - 1-minute: 30–90 seconds
  - 5-minute: 240–360 seconds
  - 15-minute: 840–960 seconds
- This accounts for slight variations in session timing.

---

## 11. Badge Definitions Reference (complete seed data)

See `src/lib/badgeDefinitions.js` in the frontend repo for the canonical list. The backend should match these exactly.

Key fields for the backend `badge_definitions` table:

| Column        | Type           | Example                                                     |
| ------------- | -------------- | ----------------------------------------------------------- |
| `id`          | `VARCHAR(50)`  | `"laser-focus"`                                             |
| `name`        | `VARCHAR(100)` | `"Laser Focus"`                                             |
| `description` | `TEXT`         | `"Keep distracted time under 5% in a session"`              |
| `icon`        | `VARCHAR(50)`  | `"Crosshair"`                                               |
| `category`    | `VARCHAR(30)`  | `"focus"`                                                   |
| `level`       | `INT`          | `2`                                                         |
| `color`       | `VARCHAR(20)`  | `"green"`                                                   |
| `rule_type`   | `VARCHAR(30)`  | `"threshold"`                                               |
| `rule_config` | `JSONB`        | `{"metric": "distracted_pct", "operator": "<", "value": 5}` |

### Color mapping

| Color    | Categories                                | Hex (top layer) |
| -------- | ----------------------------------------- | --------------- |
| `green`  | consistency, focus, presentation          | `#4CAF1E`       |
| `orange` | fluency, pace, improvement                | `#F5A623`       |
| `purple` | interview, elite                          | `#9B59F5`       |
| `gray`   | locked badges (frontend-only, not stored) | `#888888`       |

---

## Questions?

The frontend badge code lives in:

- `src/lib/badgeDefinitions.js` — all 29 badge rules
- `src/utils/scoring.js` — scoring formulas
- `src/components/Progress/BadgeIcon.jsx` — visual badge card renderer
- `src/components/Progress/BadgeGrid.jsx` — badge collection grid
- `src/components/Progress/BadgeUnlockOverlay.jsx` — unlock celebration
- `src/app/progress-v2/page.js` — progress dashboard

Each badge definition in `badgeDefinitions.js` has a `condition(ctx)` function — the corresponding `rule_config` JSON on the backend should encode what that function checks.
