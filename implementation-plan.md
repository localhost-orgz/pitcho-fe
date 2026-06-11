# Badge System Implementation Plan

## Overview

Build a badge and achievement system that rewards users for consistency, focus, speaking quality, interview performance, and personal improvement.

The badge system should encourage long-term skill development rather than simple activity farming.

Badges should be automatically unlocked based on analytics data generated after each completed session.

---

# Goals

## User Goals

- Feel a sense of progress
- Stay motivated to practice regularly
- Discover strengths and weaknesses
- Unlock achievements through skill mastery

## Business Goals

- Increase retention
- Encourage repeat practice sessions
- Improve engagement with analytics
- Create long-term progression mechanics

---

# Badge Architecture

## Badge Categories

### Consistency

Rewards users for maintaining practice habits.

### Focus

Rewards users for resisting distractions.

### Fluency

Rewards users for reducing filler words.

### Speaking Pace

Rewards users for maintaining optimal speaking speed.

### Presentation

Rewards users for completing presentation sessions.

### Interview

Rewards users for completing interview simulations.

### Improvement

Rewards users for measurable growth.

### Elite

Rewards users for exceptional performance.

---

# Database Design

## Badge Definition

```ts
interface BadgeDefinition {
  id: string;

  name: string;

  description: string;

  icon: string;

  category:
    | "consistency"
    | "focus"
    | "fluency"
    | "pace"
    | "presentation"
    | "interview"
    | "improvement"
    | "elite";

  conditionType: string;

  conditionValue: number;
}
```

---

## User Badge

```ts
interface UserBadge {
  userId: string;

  badgeId: string;

  unlockedAt: Date;
}
```

---

# Badge Definitions

---

## Consistency Badges

### First Step

Unlock Condition:

```text
Complete first session
```

---

### On a Roll

Unlock Condition:

```text
Practice 3 consecutive days
```

---

### Weekly Warrior

Unlock Condition:

```text
Practice 7 consecutive days
```

---

### Unstoppable

Unlock Condition:

```text
Practice 30 consecutive days
```

---

# Focus Badges

### Focused Speaker

Unlock Condition:

```text
Distracted Duration < 10%
```

---

### Laser Focus

Unlock Condition:

```text
Distracted Duration < 5%
```

---

### Iron Mind

Unlock Condition:

```text
Distracted Duration < 2%
```

---

### Unshakeable

Unlock Condition:

```text
Hard Mode
+
Distracted Duration < 3%
```

---

# Fluency Badges

### Smooth Talker

Unlock Condition:

```text
Filler Rate < 5
per 100 words
```

---

### Fluent Speaker

Unlock Condition:

```text
Filler Rate < 3
per 100 words
```

---

### Crystal Clear

Unlock Condition:

```text
Filler Rate < 1
per 100 words
```

---

# Pace Badges

### Perfect Pace

Unlock Condition:

```text
120-160 WPM
for 3 consecutive sessions
```

---

### Consistent Rhythm

Unlock Condition:

```text
Pace Score > 90
for 5 sessions
```

---

# Presentation Badges

### 1 Minute Speaker

Unlock Condition:

```text
Complete one
1 minute presentation
```

---

### 5 Minute Speaker

Unlock Condition:

```text
Complete one
5 minute presentation
```

---

### 15 Minute Speaker

Unlock Condition:

```text
Complete one
15 minute presentation
```

---

### Marathon Presenter

Unlock Condition:

```text
Complete ten
15 minute presentations
```

---

# Interview Badges

### First Interview

Unlock Condition:

```text
Complete first interview session
```

---

### Job Seeker

Unlock Condition:

```text
Complete 10 interviews
```

---

### Technical Challenger

Unlock Condition:

```text
Complete technical interview session
```

---

### HR Ready

Unlock Condition:

```text
Behavioral Interview
Overall Score > 85
```

---

### Case Solver

Unlock Condition:

```text
Situational Interview
Overall Score > 85
```

---

# Improvement Badges

### Getting Better

Unlock Condition:

```text
Increase score by 10 points
compared to previous session
```

---

### Breakthrough

Unlock Condition:

```text
Increase score by 20 points
compared to previous session
```

---

### Comeback

Unlock Condition:

```text
Previous Score < 60
Current Score > 80
```

---

# Elite Badges

### Presentation Master

Unlock Condition:

```text
15 Minute Session
Overall Score > 90
```

---

### Interview Master

Unlock Condition:

```text
Interview Score > 90
```

---

### Distraction Master

Unlock Condition:

```text
Hard Mode
Focus Score > 95
```

---

### Communication Expert

Unlock Condition:

```text
Focus Score > 90

Pace Score > 90

Filler Score > 90

Efficiency Score > 90

within the same session
```

---

# Badge Evaluation Engine

## Trigger Point

Run badge evaluation:

```text
After every completed session
```

Includes:

- Presentation Session
- Interview Session

---

## Evaluation Flow

```text
Session Completed

↓

Analytics Generated

↓

Overall Score Calculated

↓

Badge Engine Runs

↓

Check All Badge Rules

↓

Identify New Unlocks

↓

Persist Unlocks

↓

Show Unlock Animation
```

---

# Badge Engine

Create:

```ts
evaluateBadges(user, sessionAnalytics, sessionScore);
```

Responsibilities:

- Load user badge history
- Load badge definitions
- Evaluate unlock conditions
- Prevent duplicate unlocks
- Return newly unlocked badges

---

# Badge Notification System

When badge is unlocked:

Display achievement modal.

Example:

```text
🏆 Badge Unlocked

Laser Focus

Distracted Duration below 5%
```

Optional:

- confetti animation
- sound effect
- share button

---

# Badge Progress Tracking

Some badges require progress.

Example:

```text
Weekly Warrior
```

Display:

```text
4 / 7 days completed
```

Example:

```text
Job Seeker
```

Display:

```text
6 / 10 interviews completed
```

---

# User Profile Integration

Add:

## Badge Collection

Show:

- All unlocked badges
- Locked badges
- Badge categories

---

## Statistics

Show:

```text
Badges Earned

17 / 25
```

---

## Rare Badge Count

Show:

```text
Elite Badges

2 / 4
```

---

# Future Expansion

Design system so future badges can be added without modifying business logic.

Future examples:

- AI Feedback Master
- Resume Expert
- STAR Method Specialist
- 100 Sessions Completed
- 50 Interviews Completed
- Top 1% Community Badge

Badge conditions should remain configuration-driven whenever possible.
